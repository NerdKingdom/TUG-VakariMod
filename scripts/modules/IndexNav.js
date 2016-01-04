(function(){
	var app = angular.module('IndexNav', ['MessageHandler']);

	app.controller('IndexNavCtrl', ['$scope', 'msgHan', function($scope, msgHan, Section) {


	}]);
	

	app.directive('indexNav', function(){
		return {
			restrict: 'E',
			templateUrl: 'views/index-nav.html',
			controller: 'IndexNavCtrl',
			controllerAs: 'IndexNav',
			scope: false
		};
	});
})()