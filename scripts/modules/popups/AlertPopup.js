(function(){
    var app = angular.module('AlertPopup', ['MessageHandler']);
    app.controller('AlertCtrl', ['$scope', 'msgHan',  function($scope, msgHan) {
        var self = this;
        var cb = function(){}
        
        $scope.message = "";
        $scope.title = "Hey!";

        $scope.open = function(data){
            if (data.cb)
                cb = data.cb;
            if (data.message)
                $scope.message = data.message;
            if (data.title)
            	$scope.title = data.title;
            $scope.$apply();
            $('#alertPopup').modal('show')
        }

        $scope.close = function(){
            $('#alertPopup').modal('hide')
            cb();
        }

        $scope.msgHan = msgHan;
        msgHan.register('AlertPopup.open', $scope.open);
        msgHan.register('AlertPopup.close', $scope.close);
    }]);
    

    app.directive('alertPopup', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/popups/alert-popup.html',
            controller: 'AlertCtrl',
            controllerAs: 'AlertPopup',
            scope: true
        };
    });
})()