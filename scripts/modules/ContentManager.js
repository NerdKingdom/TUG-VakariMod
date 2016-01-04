(function(){
    var app = angular.module('ContentManager', ['TabGroup', 'MediaElement']);
    app.controller('ContentManagerCtrl', ['$scope',  function($scope) {
        var self = this;
        $scope.sectionIndex = $scope.$parent.sectionIndex
    }]);
    

    app.directive('contentManager', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/content-manager.html',
            controller: 'ContentManagerCtrl',
            controllerAs: 'ContentManager',
            scope: {
                section: '=',
                sectionIndex: '='
            }
        };
    });
})()