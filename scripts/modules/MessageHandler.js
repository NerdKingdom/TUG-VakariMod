(function(){
	var app = angular.module('MessageHandler', []);

	app.factory('msgHan', function(){
		var fsm = {
			registration: {},
			queue: [],
			register: function(evt, cb){
				if(!this.registration[evt])
					this.registration[evt] = [cb]
				else 
					this.registration[evt].push(cb)
			},
			fire: function(evt, data){
				var actions = this.registration[evt];
				if(actions){
					for(var i = 0; i < actions.length; i++){
						actions[i](data)
					}
				}else{
					//console.log('WARNING - no actions found for event: ' + evt)
					//if(data)
					//	console.log('provided with data: ' + JSON.stringify(data))
				}
			},
			delay: function(time, evt, data){
				var self = this;
				setTimeout(function(){
					self.fire(evt, data);
				}, time)
			}
		}
		return fsm;
	})
})()