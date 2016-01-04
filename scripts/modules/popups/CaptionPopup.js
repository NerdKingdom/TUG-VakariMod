(function(){
    var app = angular.module('CaptionPopup', ['MessageHandler']);
    app.controller('CaptionCtrl', ['$scope', 'msgHan',  function($scope, msgHan) {
        var self = this;
        var cb = function(){}
        
        $scope.boundObject = null;

        $scope.open = function(data){
            if(data)
                $scope.boundObject = data.boundObject;
            $('#captionPopup').modal('show')
        }

        $scope.close = function(){
            $('#captionPopup').modal('hide')
            cb();
        }

        $scope.msgHan = msgHan;
        msgHan.register('CaptionPopup.open', $scope.open);
        msgHan.register('CaptionPopup.close', $scope.close);
    }]);
    

    app.directive('captionPopup', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/popups/caption-popup.html',
            controller: 'CaptionCtrl',
            controllerAs: 'CaptionPopup',
            scope: true
        };
    });
})()