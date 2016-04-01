'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var path = require("path");
var PluginError = gutil.PluginError;
var extractTypes = require("./extract");
var generateDefinition = require("./generate");

var PLUGIN_NAME = "gulp-loopback-ts";

module.exports = function(outFile) {

    var data = {

    };
    var latestFile;
    var latestMod;
    var fileName;

    var models;
    var idTypes;

    var count = 0;

    function parseFile(file, enc, callback) {
        if (file.isNull()) {
            this.push(file);
            callback();
            return;
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, "Streaming not supported"));
            callback();
            return;
        }

        // set latest file if not already set,
        // or if the current file was modified more recently.        
        latestFile = latestFile || file;

        models = models || {};
        idTypes = idTypes || {};

        if (!file.contents.length) {
            callback();
            return;
        }

        var model = JSON.parse(file.contents.toString());
        if (!model.name) {
            latestFile = null;
            models = null;
            this.emit('error', new PluginError(PLUGIN_NAME, "Missing model 'name' member."));
            callback();
            return;
        }
        models[model.name] = model;
                
        callback();
    }

    function endStream(callback) {
        if (!latestFile || !models) {
            callback();
            return;
        }

        var joinedFile;

        if (outFile) {
            if (typeof outFile === "string") {
                joinedFile = latestFile.clone({ contents: false });
                joinedFile.path = path.join(latestFile.base, outFile);
            }
            else {
                joinedFile = new File(file);
            }
        } else {
            joinedFile = latestFile.clone({ contents: false });
            joinedFile.path = gutil.replaceExtension(latestFile.path, '.d.ts');
        }
        
        var project = extractTypes(models);
        var definitions = generateDefinition(project);       
        
        // for (var modelName in models) {
        //     if (models.hasOwnProperty(modelName)) {
        //         var model = models[modelName];

        //         var definition = generateDefinition(model, idTypes, 0);
        //         definitions.push(definition);
        //     }
        // }

        joinedFile.contents = new Buffer(definitions);
        this.push(joinedFile);
        callback();
    }

    return through.obj(parseFile, endStream);
}