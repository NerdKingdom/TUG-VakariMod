(function() {
    var app = angular.module('UpdateListPopup', ['MessageHandler']);
    app.controller('UpdateListPopupCtrl', ['$scope', 'msgHan', function($scope, msgHan) {
        var self = this;

        $scope.open = function(data) {
            $scope.text = data.text;
            $scope.cb = data.cb;
            $('#updateListPopup').modal('show')
        }

        $scope.close = function() {
            $('#updateListPopup').modal('hide')
            if ($scope.cb)
                $scope.cb($scope.text);
        }

        $scope.msgHan = msgHan;
        msgHan.register('UpdateListPopup.open', $scope.open);
        msgHan.register('UpdateListPopup.close', $scope.close);
    }]);


    app.directive('updateListPopup', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/popups/update-list-popup.html',
            controller: 'UpdateListPopupCtrl',
            controllerAs: 'UpdateListPopup',
            scope: true
        };
    });
})()