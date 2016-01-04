(function(){
    var app = angular.module('TabGroup', ['MessageHandler']);
    app.controller('TabGroupCtrl', ['$scope', 'msgHan', function($scope, msgHan) {
        var self = this;
        $scope.msgHan = msgHan;
        $scope.sectionIndex = $scope.$parent.sectionIndex
        $scope.contentIndex = $scope.$parent.contentIndex


        $scope.changeTab = function(evt, id){
            $(evt.target).closest('.tabGroup').children('.section').hide()
            $(evt.target).closest('ul').children('li').removeClass('active')
            $(evt.target).closest('li.tab').addClass('active')
            $('#'+id).show()
            msgHan.fire('EditOverlay.close')
        }
    }]);
    

    app.directive('tabGroup', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/content/tab-group.html',
            controller: 'TabGroupCtrl',
            controllerAs: 'TabGroup',
            scope: {
                content: '=',
                subtab: '@',
                sectionIndex: '='
            }
        };
    });
})()