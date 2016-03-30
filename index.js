'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;


module.exports = function(){
    return through.obj(function(file, enc, cb){
        if(file.isNull()){
            return cb(null, file);
        }
    })
}