(function() {
    var app = angular.module('EditOverlay', ['MessageHandler']);

    app.controller('EditOverlayCtrl', ['$scope', 'msgHan', function($scope, msgHan) {
        var self = this;
        var open = false;
        var stack = [];
        var $elm = null;
        var selected = $scope.$parent.selected;
        var modManifest = $scope.$parent.modManifest;
        var _overlayWindow = $('#editOverlay')
        var minHeight = Number(_overlayWindow.css('min-height').replace(/[a-z]/g, ''));
        var contentTypes = $scope.$parent.contentTypes;
        var _sectionIndex = -1;
        $scope.subtab = false;
        $scope.template = 'homeEdit';


        //This is the function that does all the manual UI
        //movement for the custom editOverlay.
        //This is the last function called to open the overlay.
        function _open() {
            $scope.resize();
            $('.edit').show()
            $('.userContent > .delete').hide()
            $('.edit i').removeClass('fa-times-circle');
            $('.edit i').addClass('fa-pencil');
            $('.edit i').css('color', 'inherit')
            $elm.find('.columns .edit').hide()
            $elm.find('.edit i').removeClass('fa-pencil');
            $elm.find('.edit i').addClass('fa-times-circle');
            $elm.find('.edit i').css('color', 'white')
            $elm.find('> .delete').show()
            $elm.find('> .delete i').css('color', 'white')
            $('#contentList li').removeClass('active')
            $('#editOverlay').show()
            $('#editOverlay').css('opacity', '1');

            open = true;
        }

        function changeTab(index) {
            var tabGroup = $elm.closest('.tabGroup');
            tabGroup.children('.section').hide();
            $(tabGroup.children('.section')[index]).show();
            var nav = tabGroup.find('.detailNav');
            nav.children('li').removeClass('active')
            $(nav.children('li.tab')[index]).addClass('active')
        }

        //This function opens the overlay programatically 
        //asuming its a subtab. This function is provided for
        //the "edit" button. It should not be triggered via a 
        //user action directly.
        function openSubtab(index) {
            $elm = $($elm.find('.sub-tab')[index])
            $scope.template = 'sectionEdit'
            changeTab(index);
            $scope.subtab = $elm.hasClass('subtab');
            selected.section = modManifest.WebPage.Sections[$elm.attr('data-index')].Content[$elm.attr('data-content-index')].Items[$elm.attr('data-subsection-index')]
            selected.content = (selected.section.Content &&
                    selected.section.Content.length > 0) ?
                selected.section.Content[0] : null;
            $elm.addClass('editing')
            _sectionIndex = $elm.closest('section.section').attr('data-index')
            stack.push({
                target: $elm
            });
            _open()
            msgHan.fire('ColorWindow.close');
        }

        $scope.open = function(evt, bubbleup) {
            evt.stopPropagation();
            //get element from event
            $elm = $(evt.target).closest('.section')
            _sectionIndex = $elm.attr('data-index')
            var lastElm = [];
            if (stack.length > 0)
                lastElm = $(stack[stack.length - 1].target).closest('.section')
                //this function works as a toggle
                //so if we are already open and we are call 
                //the same pane, just close it
            if (open && lastElm.length > 0 && lastElm[0] === $elm[0] && !bubbleup)
                return $scope.close();

            //Set template
            if ($elm.attr('id') == "home")
                $scope.template = 'homeEdit'
            else if ($elm.attr('id') == "modDetails")
                $scope.template = 'modDetailsEdit'
            else {
                $scope.template = 'sectionEdit'
                $scope.subtab = $elm.hasClass('sub-tab');

                //Set selected section and content varibles
                if (!$scope.subtab) {
                    selected.section = modManifest.WebPage.Sections[$elm.attr('data-index')]
                    selected.container = modManifest.WebPage.Sections
                } else {
                    selected.container = modManifest.WebPage.Sections[$elm.attr('data-index')].Content[$elm.attr('data-content-index')].Items;
                    selected.section = modManifest.WebPage.Sections[$elm.attr('data-index')].Content[$elm.attr('data-content-index')].Items[$elm.attr('data-subsection-index')]
                }
                selected.content = (selected.section.Content &&
                        selected.section.Content.length > 0) ?
                    selected.section.Content[0] : null;
            }

            $elm.addClass('editing')

            if (!bubbleup)
                stack.push(evt); //push event to edit stack

            _open()

            msgHan.fire('ColorWindow.close');
        }

        $scope.close = function() {
            open = false;

            selected.section = null;
            selected.content = null;
            _sectionIndex = -1;
            stack.pop();

            if (stack.length == 1) //if theres only one in stack
            {
                $('.sub-tab.editing').removeClass('editing');
                $scope.subtab = false; //we may have just closed a sub tab
                return $scope.open(stack[stack.length - 1], true)
            }

            $('#editOverlay').css('opacity', '0');
            $('#editOverlay').hide();
            try {
                $elm.find('.edit i').removeClass('fa-times-circle');
                $elm.find('.edit i').addClass('fa-pencil');
            } catch (e) { //catch the case where elm isnt defined
                //because we never opened the overlay
            } //and close is called from a competing window
            $('.edit i').css('color', 'inherit');
            $('.userContent > .delete i, #modDetails > .delete i').css('color', 'inherit')
            $('.edit').show();
            $('.userContent > .delete, #modDetails > .delete').hide();
            $('.tab-view.editing').removeClass('editing');
            $('section.editing').removeClass('editing');

            msgHan.fire('refresh');
        }

        $scope.resize = function() {
            if ($elm != null) {
                var tempElm = $elm;
                if (!tempElm.hasClass('editing'))
                    tempElm = $elm.find('.editing');
                var offset = tempElm.offset();
                if (!offset) return;
                var pad = 0;
                if (tempElm.hasClass('sub-tab'))
                    pad = 20;
                $('#editOverlay').width(tempElm.width() + pad);
                $('#editOverlay').height(tempElm.height() + pad);
                try {
                    $('#editOverlay').css('top', offset.top);
                    $('#editOverlay').css('left', offset.left);
                } catch (e) {
                    console.log('EditOverlay.resize error')
                }
                $('.edit').show();
                tempElm.find('.columns .edit').hide();
            }
        }

        $scope.processYoutubeLink = function() {
            var val = selected.content.Value;
            val = val.replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/embed/", "");
            val = val.replace("http://www.youtube.com/watch?v=", "").replace("http://www.youtube.com/embed/", "")
            val = val.replace("https://youtu.be/", "").replace("http://youtu.be/", "");
            val = val.substring(0, val.indexOf('&'));
            selected.content.Value = val;
            //$scope.$apply() //RM do I need this here?
        }

        $scope.hideDetailSection = function() {
            msgHan.fire('AreYouSurePopup.open', {
                message: "Are you sure you want to hide the built-in details section? You can unhide it in the top bar later.",
                cb: function() {
                    $scope.$parent.modManifest.WebPage.DetailHidden = true
                    msgHan.fire('AreYouSurePoup.close');
                    msgHan.fire('refresh')
                    selected.content = null;
                    $scope.close();
                }
            })
        }

        $scope.columnChange = function() {
            try {
                var columns = selected.section.Columns;
                var content = selected.section.Content;
                for (var c in content) {
                    if (content[c].Type == "MediaElement") {
                        if ($scope.subtab == true) {
                            content[c].Width = Math.floor(900 / columns);
                        } else {
                            content[c].Width = Math.floor(970 / columns);
                        }
                    }
                }
            } catch (e) {} finally {
                msgHan.delay(10, 'EditOverlay.resize');
                msgHan.delay(10, 'refresh');
            }
        }

        $scope.mediaChange = function() {
            if (open) {
                $('.carousel-inner > .item').removeClass('active')
                $('.carousel-inner > .item:first-child').addClass('active')
            }
        }

        $scope.contentAdded = function() {
            $scope.columnChange();
        }

        $scope.unhideDetailSection = function() {
            delete modManifest.WebPage.DetailHidden
                //$('#unhideDetail').hide() /RM

            msgHan.fire('refresh');
            msgHan.fire('jump', '#modDetails');
        }

        $scope.displayMediaListItem = function(item) {
            return modManifest.getMediaLink(item)
        }

        $scope.displayContentItem = function(item) {
            var items = contentTypes.filter(function(e) {
                return e.value == item.Type
            })
            if (items.length > 0)
                return items[0].title
            else return "";
        }

        $scope.openMediaBrowser = function(target) {
            msgHan.fire('MediaBrowser.open', {
                filter: target,
                cb: function(media) {
                    target.push(media.Id)
                }
            })
        }

        $scope.editTab = function(target, evt) {
            openSubtab($(evt.target).closest('li.item').index('li.item'));
        }

        $scope.editListItem = function(arr, index) {
            msgHan.fire('ListEditPopup.open', {
                text: arr[index],
                cb: function(text) {
                    arr[index] = text;
                    try {
                        $scope.$apply();
                    } catch (e) {}
                }
            })
        }



        msgHan.register('EditOverlay.open', $scope.open);
        msgHan.register('EditOverlay.close', $scope.close);
        msgHan.register('EditOverlay.resize', $scope.resize);
        msgHan.register('EditOverlay.hideDetailSection', $scope.hideDetailSection);
        msgHan.register('EditOverlay.unhideDetailSection', $scope.unhideDetailSection);
    }]);


    app.directive('editOverlay', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/edit-overlay.html',
            controller: 'EditOverlayCtrl',
            controllerAs: 'EditOverlay',
            scope: true
        };
    });
})()