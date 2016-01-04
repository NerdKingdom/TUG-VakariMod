String.prototype.firstWord = function() {
    if (this.indexOf(' ') < 0)
        return this;
    return this.substr(0, this.indexOf(' '));
}

String.prototype.lastWord = function() {
    if (this.lastIndexOf(' ') < 0)
        return this;
    return this.substr(this.lastIndexOf(' '));
}

String.prototype.makeID = function(suffix) {
    if(!suffix)suffix = ""
    return this.replace(/\s/g, "").toLowerCase() + suffix;
}

String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

//Manual substring function for when css just wont do
String.prototype.limit = function(length) {
    if (this.length > length)
        return this.substr(0, length) + "..."
    return this
}

isFunction = function(obj){
    var t = {};
 return obj && t.toString.call(obj) === '[object Function]';
}

//clean objects of their angular object identifiers by stringifying and parseing them.
clean = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}