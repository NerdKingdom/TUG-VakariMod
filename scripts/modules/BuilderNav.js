(function(){
	var app = angular.module('BuilderNav', ['MessageHandler', 'Models']);

	app.controller('BuilderNavCtrl', ['$scope', 'msgHan', 'Section', function($scope, msgHan, Section) {
        $scope.unhideDetailSection = function(){
        	$scope.modManifest.WebPage.DetailHidden = false;
        	msgHan.delay(100, 'changePage', 'modDetails')
        	msgHan.delay(200, 'jump', '#modDetails')
        }

        $scope.hideDetailSection = function(){
        	$scope.modManifest.WebPage.DetailHidden = true;
        	msgHan.delay(100, 'changePage', 'modDetails')
        }
	}]);
	

	app.directive('builderNav', function(){
		return {
			restrict: 'E',
			templateUrl: 'views/builder-nav.html',
			controller: 'BuilderNavCtrl',
			controllerAs: 'BuilderNav',
			scope: false,
			link: function(scope, element){
				$('[alt]').tooltip({
					'delay': { show: 0, hide: 0 }
				});
			}
		};
	});
})()