(function(){
    var app = angular.module('SectionManager', ['ContentManager', 'MessageHandler']);
    app.controller('SectionManagerCtrl', ['$scope', 'msgHan', function($scope, msgHan) {
        var self = this;
        $scope.msgHan = msgHan;
        $scope.manifest = $scope.$parent.modManifest;
        var selected = $scope.$parent.selected;

        $scope.moveSectionUp = function(index){
            if(index == 0)return;
            var item = selected.container.splice(index, 1)
            selected.container.splice(index-1, 0, item[0])
            msgHan.delay(20, 'deepRefresh');
        }

        $scope.moveSectionDown = function(index){
            if(index == selected.container.length-1)return;
            var item = selected.container.splice(index, 1)
            selected.container.splice(index+1, 0, item[0])
            msgHan.delay(20, 'deepRefresh');

        }
    }]);
    

    app.directive('sectionManager', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/section-manager.html',
            controller: 'SectionManagerCtrl',
            controllerAs: 'SectionManager',
            scope: {
                sections: '=',
                subtab: '@',
                sectionIndex: '='
            }
        };
    });
})()