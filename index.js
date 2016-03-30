'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = "gulp-loopback-ts";

module.exports = function(){
    return through.obj(function(file, enc, cb){
        if(file.isNull()){
            return cb(null, file);
        }
        
        if(file.isStream()){
            return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
        }
    })
}