(function(){
    var app = angular.module('HomeSection', []);
    app.controller('HomeSectionCtrl', ['$scope', function($scope) {
        var self = this;
        $scope.section = {
            Title: "Home"
        }
    }]);
    

    app.directive('homeSection', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/content/home-section.html',
            controller: 'HomeSectionCtrl',
            controllerAs: 'HomeSection',
            scope: true
        };
    });
})()