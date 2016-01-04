(function(){
	var app = angular.module('MediaBrowser', ['MessageHandler', 'Models']);

	app.controller('MediaBrowserCtrl', ['$scope', 'msgHan', 'Media', function($scope, msgHan, Media) {
		var _filter = null;
        var _view = null;
        var _cb = null;

		$scope.addMedia = {
			src: "",
			type: "Image",
			placeholders: {
				Image: "http://www.domain.com/image.jpg",
				Video: "https://www.youtube.com/watch?v=na1NMqoGZ_g"
			}
		}

        $scope.filtered = false;
        var filter = function(filter){
            _filter = filter;
            if(_filter == null){
                $scope.filtered = false
                return $scope._view = $scope.ngModel;
            }
            $scope._view = $scope.ngModel.filter(function(e){
                return _filter.indexOf(e.Id) < 0;
            })
            $scope.filtered = true
        }
        filter()

        $scope.$watch('ngModel', function(){
            filter(_filter);
        })

        $scope.$watch('_filter', function(){
            filter(_filter);
        })

        //options can be:
        //A callback function
        //An object with these properties
        //  cb: a callback function
        //  filter: an array of strings matching media Id's
		$scope.open = function(options){
			if($scope._open)
				return $scope.close()
            if(isFunction(options)){
                _cb = options
                filter()
            }else if(options){
    			if(options.filter)
    				filter(options.filter);
                else
                    filter()
                if(options.cb)
                    _cb = options.cb;
            }else{
                filter()
            }
			$scope._open = true;
			$('#mediaBrowser').addClass('active')
		}

		$scope.close = function(){
			$scope._open = false;
			_cb = null;
			$('#mediaBrowser').removeClass('active')
		}

		var youtubeThumbPrefix = $scope.$parent.youtubeThumbPrefix;
		$scope.getLink = function(media) {
            try{
                if(media.Id.charAt(0) == 'v'){
                    return youtubeThumbPrefix + media.Src + '/0.jpg';
                }else if(media.Id.charAt(0) == 'i'){
                    return media.Src;
                }
                return ""
            }catch(e){
                return ""
            }
        }

        var _deleteMedia = function(media){
            msgHan.fire('AreYouSurePopup.open', {message: "Are you sure you want to delete this piece of media?", cb: function() {
                $scope.$parent.modManifest.deleteMedia(media.Id)
                msgHan.fire('deepRefresh')
                msgHan.fire('EditOverlay.close')
                $scope._deleteMode = false;
            }})
        }

        $scope._deleteMode = false;
        $scope.delete = function(){
            $scope._deleteMode = !$scope._deleteMode;
        }

        $scope.select = function(media){
            if($scope._deleteMode)
                return _deleteMedia(media);
        	$scope.closeAdd();
        	if(_cb){
        		_cb(media)
        		$scope.close();
        	}
        }

        var _addMedia = function(){
        	var d = $scope.addMedia;
        	$scope.$parent.modManifest.Media.push(new Media(d.type, d.src, d.caption))
            filter(_filter)
        }

        var _validate = function(){
        	if(!$scope.addMedia.src)return false

    		return true
        } 

        var _open = false;
        $scope.add = function(){
        	event.stopPropagation()
        	if(_open){
        		if(_validate()){
        			_addMedia()
        			$scope.closeAdd();
        		}else{
        			$('#mediaBrowserAddError').show()
        		}
        	}else{
        		$scope.openAdd();
        	}
        }

        $scope.openAdd = function(){
        	_open = true
        	$('#mediaBrowserAdd').addClass('active')
        }

        $scope.closeAdd = function(){
        	event.stopPropagation()
        	_open = false
        	$scope.addMedia.src = "";
        	$scope.addMedia.type = "Image";
        	$('#mediaBrowserAddError').hide()
        	$('#mediaBrowserAdd').removeClass('active')
        }

        $scope.checkAddBackground = function(){
            try{
                var modManifest = $scope.$parent.modManifest;
                return modManifest.WebPage.Theme.Primary.Background.length > 0 &&
                 modManifest.WebPage.Theme.Primary.Background.indexOf('fixed') < 0 &&
                 modManifest.WebPage.Theme.Primary.Background.indexOf(' repeat') < 0
            }catch(e){ //catch the case where WebPage.Theme.Primary isnt ready yet
                return true;
            }
        }

        $scope.addURLChange = function(){
            if($scope.addMedia.src.indexOf("youtube.com/") >= 0 || $scope.addMedia.src.indexOf("youtu.be/") >= 0){
                $scope.addMedia.type = "Video";
            }
        }

		$scope.msgHan = msgHan;
		msgHan.register('MediaBrowser.open', $scope.open)
		msgHan.register('MediaBrowser.close', $scope.close)
        msgHan.register('MediaBrowser.filter', $scope.filter)
	}]);
	

	app.directive('mediaBrowser', function(){
		return {
			restrict: 'E',
			templateUrl: 'views/popups/media-browser.html',
			controller: 'MediaBrowserCtrl',
			controllerAs: 'MediaBrowser',
			scope: {
                ngModel: '='
            }
		};
	});

	
})()