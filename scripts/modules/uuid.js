(function(){
	var app = angular.module('uuid', []);

	app.factory('uuid', function() {
		var uuid = function(){
			function s4() {
			    return Math.floor((1 + Math.random()) * 0x10000)
			      .toString(16)
			      .substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			    s4() + '-' + s4() + s4() + s4();
		}
		return uuid;
	});
})()