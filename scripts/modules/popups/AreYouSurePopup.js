(function(){
    var app = angular.module('AreYouSurePopup', ['MessageHandler']);
    app.controller('AreYouSureCtrl', ['$scope', 'msgHan',  function($scope, msgHan) {
        var self = this;
        var cb = function(){}
        
        $scope.message = "";

        $scope.open = function(data){
            if (data.cb)
                cb = data.cb;
            if (data.message)
                $scope.message = data.message;
            $('#aysPopup').modal('show')
        }

        $scope.close = function(){
            $('#aysPopup').modal('hide')
        }

        $scope.yes = function(){
            cb();
            $('#aysPopup').modal('hide')
        }

        $scope.msgHan = msgHan;
        msgHan.register('AreYouSurePopup.open', $scope.open);
        msgHan.register('AreYouSurePopup.close', $scope.close);
    }]);
    

    app.directive('aysPopup', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/popups/ays-popup.html',
            controller: 'AreYouSureCtrl',
            controllerAs: 'AreYouSurePopup'
        };
    });
})()