(function(){
	var app = angular.module('ColorWindow', ['MessageHandler']);

	app.controller('ColorWindowCtrl', ['$scope', 'msgHan', function($scope, msgHan) {
		$scope.open = function(parent){
			var _window = $('#colorWindow');
			$scope.saveTheme();
			if (_window.hasClass('active'))
                _window.removeClass('active')
            else 
                _window.addClass('active')
            msgHan.fire('EditOverlay.close')
		}

		$scope.close = function(){
			$('#colorWindow').removeClass('active')
		}

		$scope.refresh = function(){
			msgHan.fire("refresh")
		}

		$scope.layoutChange = function(){
			msgHan.fire('deepRefresh')
			msgHan.fire('EditOverlay.close')
		}

		$scope.changeTheme = function() {
			$scope.modManifest.WebPage.Theme = clean($scope.modManifest.WebPage.Theme);
			msgHan.fire('deepRefresh') //RM might need to do a delay here
            msgHan.fire('EditOverlay.close')
        }

        $scope.saveTheme = function(){
        	_cachedTheme = $.extend({}, clean($scope.modManifest.WebPage.Theme));
        }

        $scope.revertTheme = function(){
        	 $scope.modManifest.WebPage.Theme = $.extend({}, clean(_cachedTheme));
        }

		$scope.msgHan = msgHan;
		msgHan.register('ColorWindow.open', $scope.open)
		msgHan.register('ColorWindow.close', $scope.close)
	}]);
	

	app.directive('colorWindow', function(){
		return {
			restrict: 'E',
			templateUrl: 'views/popups/color-window.html',
			controller: 'ColorWindowCtrl',
			controllerAs: 'ColorWindow',
			scope: true
		};
	});

	
})()