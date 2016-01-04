(function(){
	var app = angular.module('SavePopup', ['MessageHandler']);
	app.controller('SavePopupCtrl', ['$scope', 'msgHan',  function($scope, msgHan) {
		var self = this;

		$scope.open = function(parent){
            $('#savePopup').modal('show')
		}

		$scope.close = function(){
            $('#savePopup').modal('hide')
		}

		$scope.msgHan = msgHan;
		msgHan.register('SavePopup.open', $scope.open);
		msgHan.register('SavePopup.close', $scope.close);
	}]);
	

	app.directive('savePopup', function(){
		return {
			restrict: 'E',
			templateUrl: 'views/popups/save-popup.html',
			controller: 'SavePopupCtrl',
			controllerAs: 'SavePopup',
			scope: true
		};
	});
})()