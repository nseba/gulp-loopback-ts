'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = "gulp-loopback-ts";

function generateDefinition(model) {
    if (!model.name) {
        throw new PluginError(PLUGIN_NAME, "Missing model 'name' member.");
    }

    var output = "interface " + model.name;
    if (model.base) {
        output += " extends " + model.base;
    }
    output += " {\r\n";

    var properties = model.properties || {};

    for (var propertyName in properties) {
        output += "    " + propertyName;

        var property = properties[propertyName];
        if (!property.required) {
            output += "?";
        }
        output += ": " + property.type + ";\r\n";
    }

    output += "}";

    return output;
}

module.exports = function() {
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
        }

        if (!file.contents.length) {
            file.path = gutil.replaceExtension(file.path, '.d.ts');
            return cb(null, file);
        }

        var model = JSON.parse(file.contents.toString());
        try {
            var definition = generateDefinition(model);
            file.contents = new Buffer(definition);
        } catch (error) {
            return cb(error);
        }
        file.path = gutil.replaceExtension(file.path, '.d.ts');
        return cb(null, file);

    })
}