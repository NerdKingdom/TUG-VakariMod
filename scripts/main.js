(function() {


    var app = angular.module('app', ['colorpicker.module',
        'Models', 'ngEnter',
        'ngSanitize', 'MessageHandler',
        'jListView', 'ColorWindow',
        'ImagePopup', 'AreYouSurePopup',
        'AlertPopup', 'CaptionPopup',
        'SavePopup', 'WebServices',
        'BuilderNav', 'EditOverlay',
        'SectionManager', 'HomeSection',
        'DetailSection', 'MediaBrowser',
        'IndexNav', 'angular-intro', 'UpdateListPopup'
    ])

    app.config(function($sceDelegateProvider) {
        //Set up white list to allow loading of youtube and image links
        //From all sources
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            "**"
        ]);
    });

    app.controller('ModHomepageCtrl', ['$scope', 'msgHan',
        'Section', 'Manifest',
        'themeLibrary', 'Content',
        function($scope, msgHan,
            Section, Manifest,
            themeLibrary, Content) {

            $scope.ContentModel = Content;
            $scope.SectionModel = Section;
            $scope.msgHan = msgHan;
            $scope.selected = {
                color: null,
                section: null,
                content: null,
                container: null
            }

            $scope.modManifest = new Manifest()

            $scope.contentTypes = [{
                value: 'Paragraph',
                title: "Paragraph"
            }, {
                value: 'MediaElement',
                title: "Media Element"
            }, {
                value: 'Tabs',
                title: 'Tab Group'
            }, {
                value: 'List',
                title: 'List'
            }]
            $scope.tabContentTypes = [{
                value: 'Paragraph',
                title: "Paragraph"
            }, {
                value: 'MediaElement',
                title: "Media Element"
            }, {
                value: 'List',
                title: 'List'
            }]

            $scope.GitHubCreds = {
                username: "",
                password: "",
            }

            $scope.youtubePrefix = "https://www.youtube.com/embed/"
            $scope.youtubeThumbPrefix = "http://i1.ytimg.com/vi/"



            //------------ MESSAGES -------------//
            var setFileInfo = function(data) {
                $scope.fileInfo = data;
            }
            var setFileInfoSha = function(data) {
                $scope.fileInfo.sha = data;
            }
            var notify = function(data) {
                noty({
                    text: data.message,
                    type: data.type || 'info',
                    dismissQueue: true,
                    layout: "topRight",
                    theme: 'relax',
                    timeout: 3000
                });
            }
            var refresh = function() {
                $scope.system.setTheme();
            }

            var deepRefresh = function() {
                $scope.system.setLayout();
                $scope.system.setTheme();
            }

            var save = function(data) {
                $scope.modManifest.save(data)
            }

            //Smooth scrolling
            var jump = function(aid) {
                var aTag = $(aid);
                $('html,body').animate({
                    scrollTop: aTag.offset().top
                }, 'slow');
            }

            $scope.alert = function(title, msg, cb) {
                msgHan.fire('AlertPopup.open', {
                    title: title,
                    message: msg,
                    cb: cb
                });
            }

            msgHan.register('setFileInfo', setFileInfo);
            msgHan.register('setFileInfoSha', setFileInfoSha);
            msgHan.register('notify', notify);
            //msgHan.register('refresh', refresh);
            msgHan.register('deepRefresh', deepRefresh);
            msgHan.register('jump', jump);
            msgHan.register('save', save)


            //------------                        Intro                          -------------//    

            $scope.IntroChange = function(targetElement, scope) {
                if ($(targetElement) === $('detail-section .section .edit'))
                    $('detail-section .section .edit').click()
                if ($(targetElement) === $('detail-section .section textarea:first-child'))
                    $('section-manager .section:first-child .edit').click()
                console.log(this)
            };

            $scope.IntroOptions = {
                steps: [{
                    intro: "<h2>Welcome to the Nerd Kingdom Page Editor.</h2><p>Here you can edit basic information about your Devotus mod. These settings will be stored inside 'Manifest.json', within your Devotus GitHub repo.</p>"
                }, {
                    element: $('home-section')[0],
                    intro: "<h3>Home Section</h3><p>Each page starts with a home section. This shows basic information about the mod in a standard format."
                }, {
                    element: $('detail-section .section .edit')[0],
                    intro: "<h3>Editing a Section</h3><p>This is the Detail Section, another list of basic pre-formatted mod info.</p><p>To edit a section hit the pencil icon.</p>"
                }, {
                    element: $('detail-section .section textarea:first-child')[0],
                    intro: "<h3>Editing a Section</h3><p>Editing the content of each section is easy. Just select the target content, and your page preview will update behind, as you type.</p><p>Just a reminder, <b>don't forget to save!</b></p>"
                }, {
                    element: $('section-manager .section:first-child .delete')[0],
                    intro: "<h3>Removing Sections</h3><p>To remove a section hit the bottom 'section action button'.</p><p>This will delete the section you are editing. If the section pre-formatted the <i class='inline fa fa-trash-o'></i> will be replaced with a <i class='inline fa fa-eye-slash></i> which will hide the section.</p>"
                }],
                nextLabel: 'Next Tip',
                prevLabel: 'Last Tip',
                skipLabel: 'Close',
                doneLabel: 'Disable Tips'
            }


            //------------ THEME LIBRARY - Fills the 'Change Theme...' select box -------------//    

            $scope.themeLibrary = themeLibrary

            //------------ SYSTEM - INITALIZATION AND BUILDER REFRESH -------------//

            $scope.system = {
                //Sets the layout
                setLayout: function() {
                    if ($scope.modManifest.WebPage.Theme.Layout == "Tabbed") {
                        $('#modDetails, .userContent').addClass('tab-view')
                        $('.userContent.tab-view, .userContent.tab-view *').css('color', $scope.modManifest.WebPage.Theme.Body.Text, "important");
                        $('.tab-view').hide();
                        //For tabbed layouts, change the page.
                        if ($scope.modManifest.WebPage.DetailHidden)
                            this.changePage($scope.modManifest.WebPage.Sections[0].Title.makeID(0))
                        else
                            this.changePage('modDetails');
                    } else {
                        $('.tab-view').show();
                        $('#modDetails, .userContent').removeClass('tab-view').remove
                            //this.setTheme();
                    }
                    $('.tabContainer .tab-view').hide();
                    $('.tabContainer .nav li:first-child').addClass('active');
                    //Show the first tab 
                    $('.tabContainer .first, first').show();
                    //If no media in detail box, change its size
                    if ($scope.modManifest.WebPage.DetailMedia.length == 0) {
                        $('.detailBox').addClass('medium-12');
                    }
                },
                //Sets the theme classes
                setTheme: function() {
                    if ($scope.modManifest.WebPage['Theme']) {
                        $('.bodyClass:not(.colorBlock)').removeClass('bodyClass')

                        //set classes
                        $('.userContent:nth-of-type(3n+3), .primary ').addClass('primary')
                        $('.userContent:nth-of-type(odd), .secondary').addClass('secondary')
                        $('.userContent.tab-view').addClass('bodyClass').removeClass('primary').removeClass('secondary')

                        //class cleanup
                        $('.primary.secondary').removeClass('secondary');
                        $('.userContent:nth-of-type(even):not(.userContent:last-of-type)').removeClass('secondary')
                        $('.userContent:nth-of-type(even):not(.userContent:last-of-type)').removeClass('primary')
                        $('.userContent:nth-of-type(even):not(.userContent:last-of-type)').addClass('bodyClass')

                        //apply colors
                        $('.secondary').css('background-color', $scope.modManifest.WebPage.Theme.Secondary.Color);
                        $('.userContent:nth-of-type(odd) .carousel-caption, .secondary, .secondary *').css('color', $scope.modManifest.WebPage.Theme.Secondary.Text);
                        $('.userContent:nth-of-type(even), .carousel-caption').css('color', $scope.modManifest.WebPage.Theme.Body.Text)
                        $('.userContent:nth-of-type(even)').css('background-color', 'transparent');
                        $('.primary ').css('background-color', $scope.modManifest.WebPage.Theme.Primary.Color);
                        $('.primary, .primary *').css('color', $scope.modManifest.WebPage.Theme.Primary.Text);
                        $('body, .bodyClass').css('background-color', $scope.modManifest.WebPage.Theme.Body.Color);
                        $('body, .bodyClass, .bodyClass *').css('color', $scope.modManifest.WebPage.Theme.Body.Text);

                        //Deal with background images
                        /*if ($scope.modManifest.WebPage.Theme.Primary.Image) {
                            $('.primary').css('background-image', 'url(' + $scope.modManifest.WebPage.Theme.Primary.Image + ')', 'repeat');
                        }
                        if ($scope.modManifest.WebPage.Theme.Primary.Image) {
                            $('.secondary').css('background-image', 'url(' + $scope.modManifest.WebPage.Theme.Secondary.Image + ')', 'repeat');
                        }
                        if ($scope.modManifest.WebPage.Theme.Body.Image) {
                            $('body, .bodyClass').css('background', 'url(' + $scope.modManifest.WebPage.Theme.Body.Image + ')', 'repeat');
                        } else {
                            $('body, .bodyclass').css('background', $scope.modManifest.WebPage.Theme.Body.Color);
                        }*/
                        if ($scope.modManifest.WebPage.Theme.Primary.Background) {
                            $('.primary').css('background', $scope.modManifest.WebPage.Theme.Primary.Background + ' ' + $scope.modManifest.WebPage.Theme.Primary.Color);
                        } else {
                            $('.primary').css('background-image', "none");
                        }

                        //$('.userContent:last-of-type').css('background-color', $scope.modManifest.WebPage.Theme.Secondary.Color);
                        //$('.userContent:last-of-type').css('color', $scope.modManifest.WebPage.Theme.Secondary.Text);
                        if ($scope.modManifest.WebPage.Theme.Secondary.Background) {
                            $('.secondary').css('background', $scope.modManifest.WebPage.Theme.Secondary.Background + ' ' + $scope.modManifest.WebPage.Theme.Secondary.Color);
                        } else {
                            $('.secondary').css('background-image', "none");
                        }
                        if ($scope.modManifest.WebPage.Theme.Body.Background) {
                            $('.bodyClass').css('background', 'transparent')
                            $('body, .colorGroup .bodyClass').css('background', $scope.modManifest.WebPage.Theme.Body.Background + ' ' + $scope.modManifest.WebPage.Theme.Body.Color);
                        } else {
                            $('body, .bodyClass').css('background-image', "none");
                        }

                        //special classes for Detail Hidden
                        if ($scope.modManifest.WebPage['DetailHidden'] == true && $scope.modManifest.WebPage.Theme.Layout != "Tabbed") {
                            $('.userContent[data-index=0]').addClass('secondary')
                            $('.userContent[data-index=0]').removeClass('primary')
                            $('.userContent[data-index=0]').css('background-color', $scope.modManifest.WebPage.Theme.Secondary.Color);
                            $('.userContent[data-index=0], .userContent[data-index=0] *').css('color', $scope.modManifest.WebPage.Theme.Secondary.Text);
                        }


                    }
                },
                //Changes the page for tabbed layouts.
                //Only controls the page based tab group
                //Sections have tab groups which are self contained.
                //This is for the special case where the tabs house all of the sections.
                changePage: function(id, evt) {
                    if ($scope.modManifest.WebPage.Theme.Layout != "Tabbed")
                        return
                    if (evt) {
                        $(evt.target).closest('ul').children('li').removeClass('active')
                        $(evt.target).closest('li.tab').addClass('active')
                    }
                    $('#' + id).closest('body').find('#content section-manager > .section, #content detail-section > .section').hide()
                    $('#' + id).show()
                }
            }
            msgHan.register('changePage', $scope.system.changePage)

            //------------ UI - POPUPS AND GRAPHICAL RELATED FUNCTIONALITY -------------//

            $scope.icons = icons;



            $scope.$watch('modManifest', function() {
                refresh();
            }, true)
            angular.element(document).ready(function() {
                //Create default manifest
                $scope.modManifest.get(); //Get manifest from github
                if ($scope.modManifest.WebPage) {
                    $scope.system.setLayout();
                    $scope.system.setTheme();
                }
                //init are you sure popup.
                $('#aysPopup').modal({
                    show: false
                })

                $('#javascript').hide();

                //$scope.IntroStart()

                $(window).resize(function() {
                    msgHan.fire('EditOverlay.resize')
                })
            });
        }
    ])



    //http://stackoverflow.com/questions/430237/is-it-possible-to-use-js-to-open-an-html-select-to-show-its-option-list
    //Allows custom open event for HTML5 select boxes. Call dropDown(elm)
    dropDown = function(dropdown) {
        try {
            _showDropdown(dropdown);
        } catch (e) {

        }
        return false;
    };

    _showDropdown = function(element) {
        var event;
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('mousedown', true, true, window);
        element.dispatchEvent(event);
    };
    //end Stack overflow

    //font-awesome class list
    var icons = ["adjust", "adn", "align-center", "align-justify", "align-left", "align-right", "ambulance", "anchor", "android", "angellist", "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up", "angle-down", "angle-left", "angle-right", "angle-up", "apple", "archive", "area-chart", "arrow-circle-down", "arrow-circle-left", "arrow-circle-o-down", "arrow-circle-o-left", "arrow-circle-o-right", "arrow-circle-o-up", "arrow-circle-right", "arrow-circle-up", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "arrows", "arrows-alt", "arrows-h", "arrows-v", "asterisk", "at", "automobile", "backward", "ban", "bank", "bar-chart", "bar-chart-o", "barcode", "bars", "bed", "beer", "behance", "behance-square", "bell", "bell-o", "bell-slash", "bell-slash-o", "bicycle", "binoculars", "birthday-cake", "bitbucket", "bitbucket-square", "bitcoin", "bold", "bolt", "bomb", "book", "bookmark", "bookmark-o", "briefcase", "btc", "bug", "building", "building-o", "bullhorn", "bullseye", "bus", "buysellads", "cab", "calculator", "calendar", "calendar-o", "camera", "camera-retro", "car", "caret-down", "caret-left", "caret-right", "caret-square-o-down", "caret-square-o-left", "caret-square-o-right", "caret-square-o-up", "caret-up", "cart-arrow-down", "cart-plus", "cc", "cc-amex", "cc-discover", "cc-mastercard", "cc-paypal", "cc-stripe", "cc-visa", "certificate", "chain", "chain-broken", "check", "check-circle", "check-circle-o", "check-square", "check-square-o", "chevron-circle-down", "chevron-circle-left", "chevron-circle-right", "chevron-circle-up", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "child", "circle", "circle-o", "circle-o-notch", "circle-thin", "clipboard", "clock-o", "close", "cloud", "cloud-download", "cloud-upload", "cny", "code", "code-fork", "codepen", "coffee", "cog", "cogs", "columns", "comment", "comment-o", "comments", "comments-o", "compass", "compress", "connectdevelop", "copy", "copyright", "credit-card", "crop", "crosshairs", "css3", "cube", "cubes", "cut", "cutlery", "dashboard", "dashcube", "database", "dedent", "delicious", "desktop", "deviantart", "diamond", "digg", "dollar", "dot-circle-o", "download", "dribbble", "dropbox", "drupal", "edit", "eject", "ellipsis-h", "ellipsis-v", "empire", "envelope", "envelope-o", "envelope-square", "eraser", "eur", "euro", "exchange", "exclamation", "exclamation-circle", "exclamation-triangle", "expand", "external-link", "external-link-square", "eye", "eye-slash", "eyedropper", "facebook", "facebook-f", "facebook-official", "facebook-square", "fast-backward", "fast-forward", "fax", "female", "fighter-jet", "file", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-movie-o", "file-o", "file-pdf-o", "file-photo-o", "file-picture-o", "file-powerpoint-o", "file-sound-o", "file-text", "file-text-o", "file-video-o", "file-word-o", "file-zip-o", "files-o", "film", "filter", "fire", "fire-extinguisher", "flag", "flag-checkered", "flag-o", "flash", "flask", "flickr", "floppy-o", "folder", "folder-o", "folder-open", "folder-open-o", "font", "forumbee", "forward", "foursquare", "frown-o", "futbol-o", "gamepad", "gavel", "gbp", "ge", "gear", "gears", "genderless", "gift", "git", "git-square", "github", "github-alt", "github-square", "gittip", "glass", "globe", "google", "google-plus", "google-plus-square", "google-wallet", "graduation-cap", "gratipay", "group", "h-square", "hacker-news", "hand-o-down", "hand-o-left", "hand-o-right", "hand-o-up", "hdd-o", "header", "headphones", "heart", "heart-o", "heartbeat", "history", "home", "hospital-o", "hotel", "html5", "ils", "image", "inbox", "indent", "info", "info-circle", "inr", "instagram", "institution", "ioxhost", "italic", "joomla", "jpy", "jsfiddle", "key", "keyboard-o", "krw", "language", "laptop", "lastfm", "lastfm-square", "leaf", "leanpub", "legal", "lemon-o", "level-down", "level-up", "life-bouy", "life-buoy", "life-ring", "life-saver", "lightbulb-o", "line-chart", "link", "linkedin", "linkedin-square", "linux", "list", "list-alt", "list-ol", "list-ul", "location-arrow", "lock", "long-arrow-down", "long-arrow-left", "long-arrow-right", "long-arrow-up", "magic", "magnet", "mail-forward", "mail-reply", "mail-reply-all", "male", "map-marker", "mars", "mars-double", "mars-stroke", "mars-stroke-h", "mars-stroke-v", "maxcdn", "meanpath", "medium", "medkit", "meh-o", "mercury", "microphone", "microphone-slash", "minus", "minus-circle", "minus-square", "minus-square-o", "mobile", "mobile-phone", "money", "moon-o", "mortar-board", "motorcycle", "music", "navicon", "neuter", "newspaper-o", "openid", "outdent", "pagelines", "paint-brush", "paper-plane", "paper-plane-o", "paperclip", "paragraph", "paste", "pause", "paw", "paypal", "pencil", "pencil-square", "pencil-square-o", "phone", "phone-square", "photo", "picture-o", "pie-chart", "pied-piper", "pied-piper-alt", "pinterest", "pinterest-p", "pinterest-square", "plane", "play", "play-circle", "play-circle-o", "plug", "plus", "plus-circle", "plus-square", "plus-square-o", "power-off", "print", "puzzle-piece", "qq", "qrcode", "question", "question-circle", "quote-left", "quote-right", "ra", "random", "rebel", "recycle", "reddit", "reddit-square", "refresh", "remove", "renren", "reorder", "repeat", "reply", "reply-all", "retweet", "rmb", "road", "rocket", "rotate-left", "rotate-right", "rouble", "rss", "rss-square", "rub", "ruble", "rupee", "save", "scissors", "search", "search-minus", "search-plus", "sellsy", "send", "send-o", "server", "share", "share-alt", "share-alt-square", "share-square", "share-square-o", "shekel", "sheqel", "shield", "ship", "shirtsinbulk", "shopping-cart", "sign-in", "sign-out", "signal", "simplybuilt", "sitemap", "skyatlas", "skype", "slack", "sliders", "slideshare", "smile-o", "soccer-ball-o", "sort", "sort-alpha-asc", "sort-alpha-desc", "sort-amount-asc", "sort-amount-desc", "sort-asc", "sort-desc", "sort-down", "sort-numeric-asc", "sort-numeric-desc", "sort-up", "soundcloud", "space-shuttle", "spinner", "spoon", "spotify", "square", "square-o", "stack-exchange", "stack-overflow", "star", "star-half", "star-half-empty", "star-half-full", "star-half-o", "star-o", "steam", "steam-square", "step-backward", "step-forward", "stethoscope", "stop", "street-view", "strikethrough", "stumbleupon", "stumbleupon-circle", "subscript", "subway", "suitcase", "sun-o", "superscript", "support", "table", "tablet", "tachometer", "tag", "tags", "tasks", "taxi", "tencent-weibo", "terminal", "text-height", "text-width", "th", "th-large", "th-list", "thumb-tack", "thumbs-down", "thumbs-o-down", "thumbs-o-up", "thumbs-up", "ticket", "times", "times-circle", "times-circle-o", "tint", "toggle-down", "toggle-left", "toggle-off", "toggle-on", "toggle-right", "toggle-up", "train", "transgender", "transgender-alt", "trash", "trash-o", "tree", "trello", "trophy", "truck", "try", "tty", "tumblr", "tumblr-square", "turkish-lira", "twitch", "twitter", "twitter-square", "umbrella", "underline", "undo", "university", "unlink", "unlock", "unlock-alt", "unsorted", "upload", "usd", "user", "user-md", "user-plus", "user-secret", "user-times", "users", "venus", "venus-double", "venus-mars", "viacoin", "video-camera", "vimeo-square", "vine", "vk", "volume-down", "volume-off", "volume-up", "warning", "wechat", "weibo", "weixin", "whatsapp", "wheelchair", "wifi", "windows", "won", "wordpress", "wrench", "xing", "xing-square", "yahoo", "yelp", "yen", "youtube", "youtube-play", "youtube-square"]
})()