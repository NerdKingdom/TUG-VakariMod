(function(){
    var app = angular.module('DetailSection', []);
    app.controller('DetailSectionCtrl', ['$scope', function($scope) {
        var self = this;
        $scope.section = {
            Title: "Detail"
        }

        $scope.addMedia = function(){
            if ($scope.modManifest.WebPage.DetailMedia.length == 0) {
                $('.detailBox').addClass('medium-12');
            }else{
                $('.detailBox').removeClass('medium-12');
            }
        }
    }]);
    

    app.directive('detailSection', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/content/detail-section.html',
            controller: 'DetailSectionCtrl',
            controllerAs: 'DetailSection',
            scope: true
        };
    });
})()