(function() {
    var app = angular.module('ImagePopup', ['MessageHandler']);
    app.controller('ImagePopupCtrl', ['$scope', 'msgHan', function($scope, msgHan) {
        var self = this;
        var selectedColor = $scope.$parent.selected.color

        $scope.options = {
            url: "",
            repeat: false,
            center: false,
            fixed: false
        }

        $scope.open = function(parent) {
            var _window = $('#imagePopup');
            selectedColor = $scope.selected.color
            selectedColor['Image'] = ""
            if (!selectedColor.Background)
                selectedColor.Background = ""
            var bg = selectedColor.Background;
            $scope.options.repeat = bg.indexOf(" repeat") > -1;
            $scope.options.center = bg.indexOf("center") > -1;
            $scope.options.fixed = bg.indexOf("fixed") > -1;
            if (bg.indexOf('url(') > -1)
                $scope.options.url = bg.substring(bg.indexOf('url(') + 4, bg.indexOf(')'));
            else
                $scope.options.url = bg;
            _window.modal('show')
        }

        $scope.close = function() {
            if ($scope.options.url)
                selectedColor.Background = "url(" + $scope.options.url + ") " +
                ((!$scope.options.repeat) ? (($scope.options.center) ? "center center / 100% " : "0px 0px / 100% ") : (($scope.options.center) ? 'center center ' : '')) +
                (($scope.options.repeat) ? "repeat " : "no-repeat ") +
                (($scope.options.fixed) ? "fixed " : "");
            else
                selectedColor.Background = "";
            msgHan.fire('refresh')
            $('#imagePopup').modal('hide')
        }

        $scope.cancel = function() {
            $('#imagePopup').modal('hide')
        }

        $scope.clear = function() {
            selectedColor.Background = "";
            msgHan.fire('refresh')
            $('#imagePopup').modal('hide')
        }

        $scope.msgHan = msgHan;
        msgHan.register('ImagePopup.open', $scope.open);
        msgHan.register('ImagePopup.close', $scope.close);
    }]);


    app.directive('imagePopup', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/popups/image-popup.html',
            controller: 'ImagePopupCtrl',
            controllerAs: 'ImagePopup',
            scope: true
        };
    });
})()