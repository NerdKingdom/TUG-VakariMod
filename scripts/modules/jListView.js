(function(){
	var app = angular.module('jListView', ['MessageHandler', 'AreYouSurePopup']);

	app.controller('jListViewCtrl', ['$scope', '$element', 'msgHan', function($scope, $element, msgHan) {
		var self = this;
		$scope.selected = null;
		$scope.newItem = "";
		if(!($scope.ngModel instanceof Array))
			$scope.ngModel = []
		$scope.add = function(){
			var item = null;
			if($scope.field){
				item = ($scope.addModel)?new $scope.addModel($scope.newItem) : {};
				item[$scope.field] = $scope.newItem;
			}else{
				item = $scope.newItem
			}
			var index = $scope.ngModel.push(item)
			$scope.newItem = "";
			$scope.selected = $scope.ngModel[index];
			$scope.change();
		}

		$scope.delete = function(evt){
			msgHan.fire('AreYouSurePopup.open', 
				{
					message: "Are you sure you want to delete this " + ((name)?name:"item") + ".", 
					cb: function(){
						$scope.ngModel.splice($(evt.target).attr('data-index'), 1);
						$scope.change();
						$scope.select({item: $scope.ngModel[0]})
					}
				});
		}

		$scope.update = function(evt, item){
			if($scope.editFunction){
				$scope.editFunction(item, evt)
			}
			$scope.change();
		}

		$scope.display = function(item){
			if($scope['templateFunction'])
				return $scope.templateFunction(item)
			if($scope.field)
				return item[$scope.field];
			else
				return item;
		}

		$scope.select = function(item){
			return $scope.selected = item.item;
		}

		$scope.change = function(){
			if($scope.ngChange){
				eval($scope.ngChange)
			}
		}

		$element.find('.add').bind('blur keyup', function(e) {
            if (e.type === 'keyup' && e.which == 13) {
                $(this).blur()
                setTimeout(function() {
                    $element.find('.add').focus()
                }, 0)
                return;
            }
        });
        setTimeout(function() {
            $element.find('.add').focus()
        }, 0)
	}]);
	
	app.directive('listView', function(){
		return {
			restrict: 'E', //attribute or element
			templateUrl: 'views/jListView.html',
			controller: 'jListViewCtrl',
			controllerAs: 'jListView',
			scope: {//Adding this line limits and dictates scope rather than leaving it open
				ngModel: '=', //equal sign means we want to directly take the name
				addOptions: '=', //directly from the parent scope. 
				field: '@', //@ sign means we take the text, evaluate it against our scope
				addPosition: '@', // and output
				ngChange: '@', // text can be put on the right side of the sign to
				name: '@',	  // translate attr names to var names
			    title: '@',
			    selected: '=',
			    templateFunction: '=',
			    addButton: '=',
			    editFunction: '=',
			    editMode: '@',
			    addTitle: '@',
			    addValue: '@',
			    addModel: '='
			}
		};
	});
})()