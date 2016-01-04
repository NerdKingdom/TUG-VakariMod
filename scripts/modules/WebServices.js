(function() {
    var app = angular.module('WebServices', ["MessageHandler"]);

    app.factory('Repo', function() {
        if ((window.location + "").indexOf('file:////') >= 0)
            return "TUG-Nacho"
        var r = (window.location + "").substring((window.location + "").indexOf("github.io/") + 10).replace(/\/[a-z]+\./, "@@").replace('/', "@@")
        return r.substring(0, r.indexOf("@@"));
    })

    app.factory('ManifestServices', ['$http', 'Repo', 'msgHan', function($http, Repo, msgHan) {

        return {
            get: function(cb) {
                var url = "https://raw.githubusercontent.com/Devotus/" + Repo + "/master/Manifest.json"
                $http.get(url).then(function(msg) {
                    if (cb) cb(msg.data)
                }, function(err) {
                    console.log(err)
                    msgHan.fire('deepRefresh');
                    msgHan.fire('notify', {
                        message: "Couldn't Load Mod Manifest.",
                        type: "error"
                    })
                })
            },
            fileInfo: function(username, password, cb) {
                $http.defaults.headers.common.Authorization = "Basic " + btoa(username + ":" + password)
                var url = "https://api.github.com/repos/Devotus/" + Repo + "/contents/Manifest.json";
                $http.get(url).then(function(msg) {
                    msgHan.fire('setFileInfo', msg.data)
                    if (cb) cb(msg.data)
                }, function(err) {
                    console.log(err)
                    msgHan.fire('deepRefresh');
                    msgHan.fire('notify', {
                        message: "Couldn't retrieve Git repo information. Please try again later.",
                        type: "error"
                    })
                })
            },
            save: function(username, password, content, sha, cb) {
                var self = this;
                var data = {
                    message: "Commit from the Nerd Kingdom Page Builder",
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))) + "",
                    sha: sha + ""
                }

                $http.defaults.headers.post.Authorization = "Basic " + btoa(username + ":" + password)
                var url = "https://api.github.com/repos/Devotus/" + Repo + "/contents/Manifest.json";
                $http.put(url, data).then(function(msg) {
                    msgHan.fire('setFileInfoSha', msg.data.commit.sha)
                    msgHan.fire('AlertPopup.open', {
                        title: "Mod Saved",
                        message: "Your manifest has been updated. Changes may take a few minutes to take effect."
                    })
                    if (cb) cb()
                }, function(err) {
                    console.log(err)
                    msgHan.fire('notify', {
                            message: "Couldn't retrieve Git repo information. Please try again later.",
                            type: "error"
                        })
                        //self.fileInfo(username, password, function(){
                        //	self.save(username, password, content, sha, cb);
                        //})
                })
            }
        }
    }])


})()