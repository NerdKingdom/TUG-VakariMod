(function() {
    var app = angular.module('MediaElement', ['Models']);
    app.controller('MediaElementCtrl', ['$scope', 'Manifest', function($scope, Manifest) {
        var self = this;
        $scope.modManifest = $scope.$root.$$childHead.modManifest
        if (!$scope.content)
            $scope.content = {};
        if ($scope.media)
            $scope.content.Items = $scope.media
        if ($scope.width)
            $scope.content.Width = $scope.width
        if ($scope.height)
            $scope.content.Height = $scope.height
        $scope.media = $scope.content.Items

        $scope.getLink = function(id) {
            try {
                if (!$scope._modManifest)
                    $scope._modManifest = $scope.$root.$$childHead.modManifest
                return $scope._modManifest.getMediaLink(id);
            } catch (e) {
                console.log('getlink failed')
            }
        }

        $scope.getCaption = function(id) {
            try {
                var media = $scope.modManifest.Media.filter(function(e) {
                    return e.Id == id
                })[0]
                if (media) {
                    return media.Caption
                }
                return ""
            } catch (e) {
                return ""
            }
        }

        var _videoPlaying = false;

        function toggleVideo($iframe, state) {
            // if state == 'hide', hide. Else: show video
            var iframe = $($iframe)[0].contentWindow;
            func = ((state == 'hide') ? 'pauseVideo' : 'playVideo');
            iframe.postMessage('{"event":"command","func":"' + func + '","args":""}', '*');
        }

        var startVideo = function($evt) {
            $carousel = $($evt.target).closest('.carousel')
            iframe = $($evt.target).closest('.item').find('iframe');
            if (!iframe.attr('src')) return;
            iframe_source = iframe.attr('src');
            if (iframe_source.indexOf('?') < 0)
                iframe_source += "?";
            iframe_source = iframe_source + "&enablejsapi=1&autoplay=1"
            iframe.attr('src', iframe_source);
            $(iframe).load(function() {
                    var item = $(iframe).closest('.item');
                    item.parent().children().removeClass('active');
                    item.addClass('active')
                })
                // hide carousel controls
            $carousel.find('.carousel-control, .carousel-indicators').hide()
            _videoPlaying = true
                // stop the slideshow
            $carousel.carousel('pause');
        }

        var stopVideo = function($evt) {
            $carousel = $($evt.target).closest('.carousel')
            iframe = $($evt.target).closest('.item').find('iframe');
            toggleVideo(iframe, 'hide')
                // show carousel controls
            $carousel.find('.carousel-control, .carousel-indicators').show()
            _videoPlaying = false
                // start the slideshow
            $carousel.carousel('cycle');
        }

        $scope.videoClick = function($evt) {
            if (_videoPlaying)
                stopVideo($evt);
            else
                startVideo($evt);
        }

    }]);


    app.directive('mediaElement', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/content/media-element.html',
            controller: 'MediaElementCtrl',
            controllerAs: 'MediaElement',
            scope: {
                content: '=',
                media: '=',
                width: '@',
                height: '@',
                title: '@',
                change: '='
            }

        };
    });
})()