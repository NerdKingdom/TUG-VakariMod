-------------------------------------------------------------------------------
----------------- VAKARI MOD v1.1 CLIENT VERSION ------------------------------
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
--  Initialize Mod  -----------------------------------------------------------

VakariModMain = EternusEngine.ModScriptClass.Subclass("VakariModMain")

-------------------------------------------------------------------------------
--  Set Server Events  --------------------------------------------------------

VakariModMain.RegisterScriptEvent("ServerEvent_AddEntry", 		
	{ 
		data = "string",
		actionID = "int" 
	} 
)

VakariModMain.RegisterScriptEvent("ServerEvent_PlayerLog", 		
	{ 
		playerName = "string",
		actionID = "int"    
	} 
)

-------------------------------------------------------------------------------
--- Hook into functions -------------------------------------------------------

include("Scripts/Characters/LocalPlayer.lua")
include("Scripts/Characters/BasePlayer.lua")
include("Scripts/Mixins/ClientCraftingMixin.lua")

-------------------------------------------------------------------------------
-- Capture current function address -------------------------------------------

local LocalPlayer_Die 							= LocalPlayer.Die
local LocalPlayer_PrimaryAction	 				= LocalPlayer.PrimaryAction

local BasePlayer_Revive 						= BasePlayer.SharedEvent_Revive

local ClientCraftingMixin_StartCrafting 		= ClientCraftingMixin.ClientEvent_StartCrafting
local ClientCraftingMixin_InterruptCrafting 	= ClientCraftingMixin.InterruptCrafting

-------------------------------------------------------------------------------
-- Global Varaibles -----------------------------------------------------------

local VakariModObject 				= nil
local playerPositionStored 			= nil
local globalWorldPlayer	 			= nil
local globalWorldPawn 				= nil
local walkDistanceToConsiderExplore = 200
local playerRevived 				= false
local reviveTimer 					= 5
local craftTimer 					= 0
local playerIsCrafting 				= false
local craftedObject 				= ""
local clientPlayerName				= ""

-------------------------------------------------------------------------------
-- Replace Functions ----------------------------------------------------------

-- Copy from the Crafting Mixin, not calling the function there back again, just inserting code here in the mod.
ClientCraftingMixin.ClientEvent_StartCrafting = function (self, args )
	--NKPrint("ClientEvent_StartCrafting received.")

	if args.duration ~= nil then
		self.m_currentCraftDuration = args.duration
		self.m_currentCraftingTime = 0.0
		self.m_clientIsCrafting = true
		self.m_currentRecipeActionName = args.actionName
		self.m_currentRecipeDisplayName = args.displayName
		
		self.m_craftingStartSignal:Fire(self.m_currentRecipeActionName, self.m_currentRecipeDisplayName)

		-------------------------------------------- INJECTED CODE -------------------------------------

		craftTimer = args.duration
		playerIsCrafting = true

		craftedObject =  args.displayName

		---------------------------------------- END OF INJECTED CODE -----------------------------------
	else
		--NKPrint("No duration?!", false)
	end
end

-- Copy from the Crafting Mixin, not calling the function there back again, just inserting code here in the mod.
ClientCraftingMixin.InterruptCrafting = function ( self )

	self:RaiseServerEvent("ServerEvent_InterruptCrafting", {})
	self.m_craftingInterruptSignal:Fire()

	-------------------------------------------- INJECTED CODE -------------------------------------

	playerIsCrafting = false

	---------------------------------------- END OF INJECTED CODE -----------------------------------
end

--Replace Die on LocalPlayer
LocalPlayer.Die = function (self, source)
	
	local deathCause = "Health"
	if globalWorldPawn.m_energy:Value() <= 0.0 then deathCause = "Starve" end

	VakariModMain:CreateActionArray(deathCause, 7, "die")

	LocalPlayer_Die(self, source)
end

-- Replace revive on BasePlayer
BasePlayer.SharedEvent_Revive = function (self, args)

	playerRevived = true
	BasePlayer_Revive(self, args)
end

-------------------------------------------------------------------------------
-- Basic Event Info Functions -------------------------------------------------

-- Create Action Array to send for the server
function VakariModMain:CreateActionArray(SubAction, ActionID, UniqueValue)

	local actionArray = {}

	actionArray[1] = clientPlayerName
	actionArray[2] = SubAction
	local playerPosition = VakariModMain:GetPlayerPosition()
	actionArray[3] = playerPosition[1]
	actionArray[4] = playerPosition[2]
	actionArray[5] = playerPosition[3]
	actionArray[6] = VakariModMain:GetPlayerBiome()
	actionArray[7] = UniqueValue

	local JSONString = '{"name":"' .. actionArray[1] .. '","subAction":"' .. actionArray[2] .. '","position":[' .. actionArray[3] .. ',' .. actionArray[4] .. ',' .. actionArray[5] .. '],"biome":' .. actionArray[6] .. ',"uniqueValue":"' .. actionArray[7] .. '"}'

	if Eternus.IsClient then 
		VakariModMain:CallServerEvent(ActionID, JSONString)
	end
end

-- Call the specific server event based on the action ID
function VakariModMain:CallServerEvent(ActionID, JSONString)

	if 	   (ActionID >= 1 and ActionID <= 11) then VakariModObject:RaiseServerEvent("ServerEvent_AddEntry", { data = JSONString , actionID = ActionID })
	else NKWarn("Invalid Action ID - not sending to server") end

	-- reset player stored position everytime player performs an action
	-- this way explored event will be only called when the player is only exploring
	VakariModMain:ResetPlayerStoredPosition()
end

-- Store the player current position to playerPositionStored 
function VakariModMain:ResetPlayerStoredPosition()
	
	if globalWorldPawn then
		playerPositionStored = globalWorldPawn:NKGetPosition()
	end
end

-- Get player current position in the world and saves it in an array[3]
function VakariModMain:GetPlayerPosition()

	local playerPosition = {}

	if globalWorldPawn then 
		local position = globalWorldPawn:NKGetPosition()
		playerPosition[1] = position:x()
		playerPosition[2] = position:y()
		playerPosition[3] = position:z()
	end

	return playerPosition
end

-- Get player current biome (only the one with the biggest weight value)
function VakariModMain:GetPlayerBiome()

	local rawWeights = globalWorldPlayer:NKGetBiomeWeights()

	local currentBiomeID = nil
	local oldWeight = 0

	for biomeIDs, biomeWeights in pairs(rawWeights) do
		if biomeWeights > oldWeight then
			oldWeight = biomeWeights
			currentBiomeID = biomeIDs
		end
	end
	return currentBiomeID
end

-- Calculate player walk distance every tick, with greater than walkDistanceToConsiderExplore calls the explore event
function VakariModMain:CalculatePlayerWalkDistance()
	
	local playerPosition = globalWorldPawn:NKGetPosition()

	local distance = math.sqrt( ( playerPositionStored:x() - playerPosition:x() )^2 + ( playerPositionStored:y() - playerPosition:y() )^2 + ( playerPositionStored:z() - playerPosition:z() )^2 ) 

	-- request the acion event if the distance is greater than the explore distance
	if distance > walkDistanceToConsiderExplore then
		if Eternus.IsClient then 
			VakariModMain:CreateActionArray("", 6, "")
		end
	end
end

-------------------------------------------------------------------------------
-- Game Events Functions ------------------------------------------------------

--Called when player is ready, avoid nil values when initizaling
function VakariModMain:LocalPlayerReady(Player)	
	
	globalWorldPawn 		= Player
	playerPositionStored	= globalWorldPawn:NKGetPosition() 
	globalWorldPlayer 		= Eternus.World:NKGetLocalWorldPlayer()
	clientPlayerName		= globalWorldPlayer:NKGetPlayerName()

	if Eternus.IsClient then 
		VakariModObject:RaiseServerEvent("ServerEvent_PlayerLog", { playerName = clientPlayerName , actionID = 10 })
	end

	playerRevived 			= false

end

function VakariModMain:IsDedicatedServer()
	return (Eternus.IsServer and not Eternus.IsClient)
end

function VakariModMain:Constructor()
	NKWarn("VakariModMain>> Constructor")

	VakariModObject = self
end

 -- Called once from C++ at engine initialization time
function VakariModMain:Initialize()
	NKWarn("VakariModMain>> Initialize")

	self:InitKeybinds()
end

-- Called from C++ when the current game enters 
function VakariModMain:Enter()	
	NKWarn("VakariModMain>> Enter")

	--if Eternus.IsClient then
	--	Eternus.InputSystem:NKPushInputContext(self.m_modInputContext)
	--end
end

-- Called from C++ when the game leaves it current mode
function VakariModMain:Leave()
	NKWarn("VakariModMain>> Leave")

	if Eternus.IsClient then 
		VakariModObject:RaiseServerEvent("ServerEvent_PlayerLog", { playerName = clientPlayerName , actionID = 11 })
	end

	--if Eternus.IsClient then
	--	Eternus.InputSystem:NKRemoveInputContext(self.m_modInputContext)
	--end
end

-- Called from C++ every update tick -- Timers for events are here
function VakariModMain:Process(dt)

	if playerPositionStored and not playerRevived then
		VakariModMain:CalculatePlayerWalkDistance()
	end

	-- Timer to not send explore event after reviving
	if playerRevived then
		reviveTimer = reviveTimer - dt

		if(reviveTimer < 0) then
			playerRevived = false
			reviveTimer = 5
			VakariModMain:ResetPlayerStoredPosition()
		end
	end

	-- Timer for the craft event system
	if playerIsCrafting then
		craftTimer = craftTimer - dt

		if(craftTimer < 0) then
			playerIsCrafting = false
			VakariModMain:ResetPlayerStoredPosition()

			-- Crafting event
			if Eternus.IsClient then 
				VakariModMain:CreateActionArray("Regular", 4, craftedObject) --craftedObject
			end
		end
	end

end

-------------------------------------------------------------------------------
-- Server calls ---------------------------------------------------------------

function VakariModMain:InitKeybinds()
	--self.m_modInputContext = InputMappingContext.new("VakariModInput")
	--self.m_modInputContext:NKSetInputPropagation(true)
end

function VakariModMain:ServerEvent_AddEntry( args )
	if (args.data == nil) then
		return
	end
	Eternus.VakariService:NKLogEvent(args.actionID, args.data)
end


function VakariModMain:ServerEvent_PlayerLog( args )
	if (args.playerName == nil) then
		return
	end
	Eternus.VakariService:NKLogEvent(args.actionID, args.playerName)
end

-------------------------------------------------------------------------------
-- Input Commands -------------------------------------------------------------

EntityFramework:RegisterModScript(VakariModMain)