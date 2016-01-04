(function() {
    var app = angular.module('Models', ['uuid', 'MessageHandler', 'WebServices']);

    app.factory('Media', ['uuid',
        function(uuid) {
            var Media = function(type, url, caption) {
                this.Id = uuid();
                switch (type.toLowerCase()) {
                    case 'video':
                        this.Id = 'v' + this.Id;
                        this.Src = this.processYoutubeLink(url) || "";
                        break;
                    case 'image':
                    case 'img':
                        this.Id = 'i' + this.Id;
                        this.Src = url || "";
                        break;
                }

                this.Caption = caption || "";
            }

            Media.prototype.processYoutubeLink = function(val) {
                val = val.replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/embed/", "");
                val = val.replace("http://www.youtube.com/watch?v=", "").replace("http://www.youtube.com/embed/", "")
                val = val.replace("https://youtu.be/", "").replace("http://youtu.be/", "");
                if (val.indexOf('&') > 0)
                    val = val.substring(0, val.indexOf('&'));
                return val;
            }

            return Media;
        }
    ])

    app.factory('Content', [

        function() {
            var subtab = false;

            var Content = function(type, data, sTab) {
                if (typeof type != "string") {
                    for (var prop in type) this[prop] = type[prop];
                    return;
                }
                this.Type = type;
                switch (type) {
                    case "MediaElement":
                        this.Height = 375; //default
                        if (sTab == true) {
                            subtab = sTab
                            this.Width = Math.floor(930 / 1 /*columns*/ );
                        } else {
                            this.Width = Math.floor(970 / 1 /*columns*/ );
                        }
                        this.Caption = ""
                    case "List":
                    case "Tabs":
                        //Items is an array of strings for
                        //both list and mediaElement (the Id)
                        this.Items = data || [];
                        break;
                    case "Paragraph":
                        this.Value = data || "Sample Text...";
                        break;
                    default:
                        this.Value = data || "";
                }
            }

            Content.prototype._defaultWidth = 970
            Content.prototype._subtabWidth = 930

            Content.prototype.destroy = function() {
                //delete element and controller
            }

            Content.prototype.calcWidth = function(columns) {
                if (subtab)
                    return Math.floor(this._subtabWidth / columns);
                else
                    return Math.floor(this._defaultWidth / columns);
            }

            Content.prototype.addItem = function(item) {
                if (this.Items) {
                    this.Items.push(item)
                }
            }

            //arg0 can be:
            //mediaID - string
            //index - int
            Content.prototype.deleteItem = function(arg0) {
                if (this.Items) {
                    if (!isNaN(arg0)) {
                        //arg0 is index
                        this.Items.splice(arg0, 1)
                    } else if (typeof arg0 === "string") {
                        //arg0 is mediaID
                        this.Items = this.Items.filter(function(e) {
                            return e.Id != arg0;
                        })
                    }
                }
            }

            return Content;
        }
    ])

    app.factory('Section', ['Content', 'msgHan',
        function(Content, msgHan) {
            var Section = function(obj) {
                this.Title = "New Section";
                this.Headline = "";
                this.Icon = "forumbee";
                this.Columns = "1";
                this.Content = [new Content("Paragraph", "Sample text...")];
                for (var prop in obj) this[prop] = obj[prop];
            };

            Section.prototype.addContent = function(type) {
                var content = new Content(type);
                this.Content.push();
                msgHan.fire('EditOverlay.Resize');
                msgHan.fire('refresh');
                msgHan.fire('select.content', content); //do I need this here?
            }

            Section.prototype.deleteContent = function(index) {
                $scope.msgHan.fire('AreYouSurePopup.open', {
                    message: "Are you sure you want to delete this piece of content?",
                    cb: function() {
                        this.Content.splice(index, 1);
                    }
                })
            }

            Section.prototype.select = function() {

            }

            return Section;
        }
    ])



    app.factory('Manifest', ['msgHan', 'ManifestServices', 'Section', 'Content', 'Media',
        function(msgHan, ManifestServices, Section, Content, Media) {
            var defaultMedia1 = new Media('video', "na1NMqoGZ_g")
            var defaultMedia2 = new Media('image', "http://www.rockpapershotgun.com/images/13/may/tug.jpg")

            var DefaultManifest = {
                WebPage: function() {
                    return {
                        HeaderMedia: [defaultMedia1.Id],
                        DetailMedia: [defaultMedia2.Id],
                        DetailHidden: false,
                        Sections: [{
                            Title: "Changes",
                            Headline: "To change or add sections, edit the mod\'s manifest.",
                            Icon: "forumbee",
                            Columns: "1",
                            Content: [{
                                "Type": "Paragraph",
                                "Value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dapibus arcu at dui congue iaculis. Morbi placerat lorem laoreet sem elementum, vel laoreet sem ultricies. Cras aliquam, libero molestie vehicula vulputate, dui est condimentum nisi, eget sodales erat sem sit amet lectus. Donec nec imperdiet felis, porttitor sollicitudin nulla. Donec ac vestibulum ligula. Nam cursus tristique massa, in tempus elit molestie a. Suspendisse metus dolor, cursus malesuada eros id, convallis bibendum magna. Nullam laoreet est ante, id ornare ante finibus non."
                            }, {
                                "Type": "Paragraph",
                                "Value": "Etiam eget tincidunt nulla. Proin auctor iaculis mauris, vitae sollicitudin velit. Morbi et odio lorem. Donec in nisi a erat pellentesque porttitor. Nam risus neque, sagittis eget urna a, efficitur vulputate nibh. Duis et sem eu leo condimentum dictum. Mauris a gravida dui. Donec pretium tortor ut pellentesque pharetra. Quisque posuere aliquet massa eu ornare. Vivamus tincidunt massa ac erat commodo tempus. Nunc a dui sed nisl cursus tincidunt ac ut mauris. Nulla elementum non lectus sit amet fermentum. Nunc ac velit et orci vestibulum pharetra. Nullam nec enim eleifend, dignissim quam vel, tincidunt tellus. Donec vel commodo augue."
                            }]
                        }, {
                            Title: "Features",
                            Icon: "cubes",
                            Background: "rgba(255,255,255,.4",
                            Columns: "1",
                            Content: [{
                                Type: "List",
                                Items: ["Awesome Feature 1", "Spectacular Feature 2", "Wonderful Feature 3", "Crazy Feature 4", "Mind-bending Feature 5"]
                            }]
                        }, {
                            Title: "Instructions",
                            Icon: "wrench",
                            Columns: "1",
                            Content: [{
                                Type: "Tabs",
                                Items: [{
                                    Title: "Step 1",
                                    Icon: "bolt",
                                    Content: [{
                                        "Type": "Paragraph",
                                        "Value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dapibus arcu at dui congue iaculis. Morbi placerat lorem laoreet sem elementum, vel laoreet sem ultricies. Cras aliquam, libero molestie vehicula vulputate, dui est condimentum nisi, eget sodales erat sem sit amet lectus. Donec nec imperdiet felis, porttitor sollicitudin nulla. Donec ac vestibulum ligula. Nam cursus tristique massa, in tempus elit molestie a. Suspendisse metus dolor, cursus malesuada eros id, convallis bibendum magna. Nullam laoreet est ante, id ornare ante finibus non."
                                    }, {
                                        "Type": "Paragraph",
                                        "Value": "Etiam eget tincidunt nulla. Proin auctor iaculis mauris, vitae sollicitudin velit. Morbi et odio lorem. Donec in nisi a erat pellentesque porttitor. Nam risus neque, sagittis eget urna a, efficitur vulputate nibh. Duis et sem eu leo condimentum dictum. Mauris a gravida dui. Donec pretium tortor ut pellentesque pharetra. Quisque posuere aliquet massa eu ornare. Vivamus tincidunt massa ac erat commodo tempus. Nunc a dui sed nisl cursus tincidunt ac ut mauris. Nulla elementum non lectus sit amet fermentum. Nunc ac velit et orci vestibulum pharetra. Nullam nec enim eleifend, dignissim quam vel, tincidunt tellus. Donec vel commodo augue."
                                    }]
                                }, {
                                    Title: "Step 2",
                                    Icon: "rocket",
                                    Content: [{
                                        Type: "Paragraph",
                                        Value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dapibus arcu at dui congue iaculis. Morbi placerat lorem laoreet sem elementum, vel laoreet sem ultricies. Cras aliquam, libero molestie vehicula vulputate, dui est condimentum nisi, eget sodales erat sem sit amet lectus. Donec nec imperdiet felis, porttitor sollicitudin nulla. Donec ac vestibulum ligula. Nam cursus tristique massa, in tempus elit molestie a. Suspendisse metus dolor, cursus malesuada eros id, convallis bibendum magna. Nullam laoreet est ante, id ornare ante finibus non."
                                    }, {
                                        Type: "Paragraph",
                                        Value: "Etiam eget tincidunt nulla. Proin auctor iaculis mauris, vitae sollicitudin velit. Morbi et odio lorem. Donec in nisi a erat pellentesque porttitor. Nam risus neque, sagittis eget urna a, efficitur vulputate nibh. Duis et sem eu leo condimentum dictum. Mauris a gravida dui. Donec pretium tortor ut pellentesque pharetra. Quisque posuere aliquet massa eu ornare. Vivamus tincidunt massa ac erat commodo tempus. Nunc a dui sed nisl cursus tincidunt ac ut mauris. Nulla elementum non lectus sit amet fermentum. Nunc ac velit et orci vestibulum pharetra. Nullam nec enim eleifend, dignissim quam vel, tincidunt tellus. Donec vel commodo augue."
                                    }, {
                                        Type: "Paragraph",
                                        Value: "Etiam eget tincidunt nulla. Proin auctor iaculis mauris, vitae sollicitudin velit. Morbi et odio lorem. Donec in nisi a erat pellentesque porttitor. Nam risus neque, sagittis eget urna a, efficitur vulputate nibh. Duis et sem eu leo condimentum dictum. Mauris a gravida dui. Donec pretium tortor ut pellentesque pharetra. Quisque posuere aliquet massa eu ornare. Vivamus tincidunt massa ac erat commodo tempus. Nunc a dui sed nisl cursus tincidunt ac ut mauris. Nulla elementum non lectus sit amet fermentum. Nunc ac velit et orci vestibulum pharetra. Nullam nec enim eleifend, dignissim quam vel, tincidunt tellus. Donec vel commodo augue."
                                    }]
                                }, {
                                    Title: "Step 3",
                                    Icon: "bullseye",
                                    Content: [{
                                        Type: "Paragraph",
                                        Value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dapibus arcu at dui congue iaculis. Morbi placerat lorem laoreet sem elementum, vel laoreet sem ultricies. Cras aliquam, libero molestie vehicula vulputate, dui est condimentum nisi, eget sodales erat sem sit amet lectus. Donec nec imperdiet felis, porttitor sollicitudin nulla. Donec ac vestibulum ligula. Nam cursus tristique massa, in tempus elit molestie a. Suspendisse metus dolor, cursus malesuada eros id, convallis bibendum magna. Nullam laoreet est ante, id ornare ante finibus non."
                                    }]
                                }]
                            }]
                        }],
                        Theme: {
                            Name: "Nerd Kingdom",
                            Layout: "Scroll",
                            HideNavBar: false,
                            Primary: {
                                Color: "#175ba5",
                                Text: "#ffffff",
                                //"Image": "http://www.atableprovencale.com/wp-content/uploads/2013/04/Fleur-De-Lis-Pattern-Background-2-s5.png"
                            },
                            Secondary: {
                                Color: "#d7e1e7",
                                Text: "#333333"
                            },
                            Body: {
                                Color: "#E1E1E1",
                                Text: "#333333",
                                Background: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAATElEQVQYV2N8+e7jfwYoEBfiZ4SxYTRMnhFZIUgSl2IMhbgUg61CNxWbYribCClGcTw+xTh9iex7kAcxFOJyM9jX+MIPZjI8eAgpBgAi7zbuVcN9gQAAAABJRU5ErkJggg==)"
                            }
                        }
                    }
                }
            }

            var Manifest = function() {
                this.Name = "Example",
                    this.Summary = "Example TUG mod for Devotus testing",
                    this.Description = "This is a simple example mod for TUG that is primarily used to test Devotus features.  It provides no functional gameplay benefit and should not be downloaded by anyone.",
                    this.Website = "",
                    this.Active = false,
                    this.TargetGame = {
                        Name: "TUG",
                        Version: {
                            Major: 0,
                            Minor: 0,
                            Revision: 0
                        }
                    },
                    this.Authors = [{
                        GitUsername: "Maylyon",
                        NkUsername: "Maylyon",
                        Email: "maylyon@nerdkingdom.com"
                    }, {
                        GitUsername: "nascarjake",
                        NkUsername: "Flying314",
                        Email: "nascarjake@gmail.com"
                    }],
                    this.Dependencies = [{
                        Name: "Parent-Mod",
                        Version: {
                            Major: 0,
                            Minor: 0,
                            Revision: 0
                        }
                    }],
                    this.Categories = [
                        "Automation",
                        "Cosmetics",
                        "Generation",
                        "Library",
                        "Magic",
                        "Miscellaneous",
                        "Nature",
                        "Technology",
                        "Utility"
                    ],
                    this.Media = [
                        defaultMedia1,
                        defaultMedia2
                    ],
                    this.Icon = "http://tugfiles.nerdkingdom.com/www/img/tug-logo.png",
                    this.WebPage = new DefaultManifest.WebPage()
                processSections(this.WebPage.Sections)
            };

            var getFileInfo = function(username, password, cb) {
                var self = this;
                ManifestServices.fileInfo(username, password, function(data) {
                    cb(data)
                })
            }

            var checkLegacy = function(e) {
                return e.Type == 'Image' || e.Type == 'Video'
            }

            var legacyContentConversion = function(e) {
                switch (e.Type) {
                    case 'Video':
                        delete e.Value;
                    case 'Image':
                        e.Items = [];
                        e.Type = 'MediaElement';
                }
            }

            var processSections = function(sections) {
                for (var i = 0; i < sections.length; i++) {
                    sections[i] = new Section(sections[i])
                    for (var c = 0; c < sections[i].Content.length; c++) {
                        if (checkLegacy(sections[i].Content[c]))
                            legacyContentConversion(sections[i].Content[c])
                        sections[i].Content[c] = new Content(sections[i].Content[c])
                    }
                }
            }

            Manifest.prototype.deleteMedia = function(mediaID) {
                var sections = this.WebPage.Sections;
                this.Media = this.Media.filter(function(e) {
                    return e.Id != mediaID
                })

                //delete related media Id's out of user sections
                for (var s in sections) {
                    for (var c in sections[s].Content) {
                        var content = sections[s].Content[c];
                        if (content.Type == "MediaElement") {
                            var index = content.Items.indexOf(mediaID)
                            if (index >= 0) {
                                content.Items.splice(index, 1)
                            }
                        }
                        if (content.Type == "Tabs") {
                            for (var st in sections[s].Content[c].Items) {
                                var subcontent = sections[s].Content[c].Items[st].Content
                                for (var sc in subcontent) {
                                    if (subcontent[sc].Type == 'MediaElement') {
                                        var subindex = subcontent[sc].Items.indexOf(mediaID)
                                        if (subindex >= 0) {
                                            subcontent[sc].Items.splice(subindex, 1)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                //delete related media Id's out of default media sections
                var hIndex = []
                for (var h in this.WebPage.HeaderMedia) {
                    if (this.WebPage.HeaderMedia[h] == mediaID)
                        hIndex.push(h)
                }
                for (var hi in hIndex) {
                    this.WebPage.HeaderMedia.splice(hIndex[hi] - hi, 1)
                }

                var dIndex = []
                for (var d in this.WebPage.DetailMedia) {
                    if (this.WebPage.DetailMedia[d] == mediaID)
                        dIndex.push(d)
                }
                for (var di in dIndex) {
                    this.WebPage.DetailMedia.splice(dIndex[di] - di, 1)
                }

                //Jquery task to select an active item on all carousels
                //This will reset all carousels
                $('.carousel-inner > .item').removeClass('active')
                $('.carousel-inner > .item:first-child').addClass('active')
            }

            Manifest.prototype.getMediaLink = function(id) {
                try {
                    var media = this.Media.filter(function(e) {
                        return e.Id == id
                    })[0]
                    if (media) {
                        if (media.Id.charAt(0) == 'v') {
                            return "https://www.youtube.com/embed/" + media.Src + "?controls=0"
                        } else if (media.Id.charAt(0) == 'i') {
                            return media.Src;
                        }
                    }
                    return ""
                } catch (e) {
                    return ""
                }
            }

            Manifest.prototype.get = function(cb) {
                var self = this;
                ManifestServices.get(function(msg) {
                    if (!msg.WebPage || !msg.WebPage.Sections) {
                        msg.WebPage = new DefaultManifest.WebPage();
                    }
                    processSections(msg.WebPage.Sections)
                    for (var prop in msg) self[prop] = msg[prop]; //shallow copy
                    self.validate()
                    msgHan.delay(200, 'deepRefresh') //C&C how can I refresh here without delay
                    if (cb) cb(self) // cb is the same refresh function, so it should refresh right
                        //after this. But angular isnt done binding yet.
                })
            }

            Manifest.prototype.save = function(options) {
                var self = this;
                getFileInfo(options.username, options.password, function(data) {
                    ManifestServices.save(options.username, options.password, self, data.sha, function(msg) {
                        $.extend(self, msg);
                        if (options.cb) options.cb(self)
                    })
                })
            }

            Manifest.prototype.validate = function() {
                if (!this.Icon) {
                    this.Icon = "http://tugfiles.nerdkingdom.com/www/img/tug-logo.png";
                }
                if (!this.Media) {
                    this.Media = [defaultMedia1, defaultMedia2]
                }
                if (this.Media.Images || this.Media.Videos)
                    this.Media = [defaultMedia1, defaultMedia2]
                if (!this.WebPage) {
                    this.WebPage = new DefaultManifest.WebPage();
                    processSections(this.WebPage.Sections)
                }
                if (!this.WebPage.HeaderMedia && this.Media.length > 0)
                    this.WebPage.HeaderMedia = [this.Media[0].Id]
                if (!this.WebPage.DetailMedia && this.Media.length > 1)
                    this.WebPage.DetailMedia = [this.Media[1].Id]
            }

            Manifest.prototype.addSection = function(section) {
                if (!(section instanceof Section)) //check to see if param is a section
                    section = new Section(section) //the param is actuall a title
                this.WebPage.Sections.push(section);
                msgHan.delay(100, 'refresh');
                msgHan.fire('editOverlayResize');
                msgHan.fire('jump', '#' + section.Title.makeID() + (this.WebPage.Sections.length - 2));
            }

            Manifest.prototype.deleteSection = function(evt) {
                var self = this;
                msgHan.fire('AreYouSurePopup.open', {
                    message: "Are you sure you want to delete this section?",
                    cb: function() {
                        var $section = $(evt.target).closest('.section')
                        var index = Number($section.attr('data-index'))
                        self.WebPage.Sections.splice(index, 1)
                        msgHan.fire('EditOverlay.close')
                        msgHan.fire('select.clear')
                        msgHan.fire('AreYouSurePopup.close')
                    }
                })
            }

            return Manifest;
        }
    ])

    app.factory('themeLibrary', function() {
        return [{
            "Name": "Nerd Kingdom",
            "Layout": "Scroll",
            "HideNavBar": false,
            "Primary": {
                "Color": "#175ba5",
                "Text": "#ffffff",
                "Background": ""
            },
            "Secondary": {
                "Color": "#d7e1e7",
                "Text": "#333333",
                "Background": ""
            },
            "Body": {
                "Color": "#ecf0f1",
                "Text": "#333333",
                "Background": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAATElEQVQYV2N8+e7jfwYoEBfiZ4SxYTRMnhFZIUgSl2IMhbgUg61CNxWbYribCClGcTw+xTh9iex7kAcxFOJyM9jX+MIPZjI8eAgpBgAi7zbuVcN9gQAAAABJRU5ErkJggg==)"
            }
        }, {
            "Name": "TUG",
            "Layout": "Scroll",
            "HideNavBar": false,
            "Primary": {
                "Color": "#4E3C1C",
                "Text": "#fefde7",
                "Background": ""
            },
            "Secondary": {
                "Color": "#5b5a4d",
                "Text": "#fefde7",
                "Background": ""
            },
            "Body": {
                "Color": "#d7c789",
                "Text": "#333333",
                "Background": "url(http://tugfiles.nerdkingdom.com/www/img/bg.jpg) center no-repeat fixed"
            }
        }, {
            "Name": "Simple Red",
            "Layout": "Scroll",
            "HideNavBar": false,
            "Primary": {
                "Color": "#c0392b",
                "Text": "#fff",
                "Background": ""
            },
            "Secondary": {
                "Color": "#2c3e50",
                "Text": "#fff",
                "Background": ""
            },
            "Body": {
                "Color": "#ecf0f1",
                "Text": "#333333",
                "Background": ""
            }
        }, {
            "Name": "Simple Green",
            "Layout": "Scroll",
            "HideNavBar": false,
            "Primary": {
                "Color": "#27ae60",
                "Text": "#fff",
                "Background": ""
            },
            "Secondary": {
                "Color": "#2c3e50",
                "Text": "#fff",
                "Background": ""
            },
            "Body": {
                "Color": "#ecf0f1",
                "Text": "#333333",
                "Background": ""
            }
        }, {
            "Name": "Dark",
            "Layout": "Scroll",
            "HideNavBar": false,
            "Primary": {
                "Color": "#34495e",
                "Text": "#fff",
                "Background": ""
            },
            "Secondary": {
                "Color": "#333",
                "Text": "#fff",
                "Background": ""
            },
            "Body": {
                "Color": "#7f8c8d",
                "Text": "#fff",
                "Background": ""
            }
        }]
    })


})()