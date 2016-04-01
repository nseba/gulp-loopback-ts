var should = require('should');
var fs = require('fs');
var loopbackTs = require("../index");
var path = require("path");
var gutil = require('gulp-util');
require("mocha");

var createVinyl = function createVinyl(filename, contents) {
    var base = path.join(__dirname, 'models');
    var filePath = path.join(base, filename);

    return new gutil.File({
        'cwd': __dirname,
        'base': base,
        'path': filePath,
        'contents': contents || fs.readFileSync(filePath)
    });
};

function compileFile(inputFileName, outputFileName, done) {
    var simpleFile = createVinyl(inputFileName);

    var stream = loopbackTs();

    stream.on("data", function(tsdFile) {        
        should.exist(tsdFile);
        should.exist(tsdFile.path);
        should.exist(tsdFile.relative);
        should.exist(tsdFile.contents);
        should.equal(path.basename(tsdFile.path), outputFileName);

        String(tsdFile.contents).should.equal(
            fs.readFileSync(path.join(__dirname, 'expected/' + outputFileName), 'utf-8')
        );        
        
        done();
    });

    stream.write(simpleFile);
    stream.end();
}

describe('gulp-loopback-ts', function() {
    it("should pass file when it isNull()", function(done) {
        var stream = loopbackTs();        
        var emptyFile = {
            'isNull': function() {
                return true;
            }
        };

        stream.on('data', function(data) {            
            data.should.equal(emptyFile);
            done();            
        });
        stream.write(emptyFile);
        stream.end();
    });

    it("should emit error when file isStream()", function(done) {
        var stream = loopbackTs();

        var streamFile = {
            "isNull": function() {
                return false;
            },
            "isStream": function() {
                return true;
            }
        }

        stream.on("error", function(err) {
            err.message.should.equal("Streaming not supported");    
            done();        
        });

        stream.write(streamFile);
        stream.end();
    });

    it("should compile an empty model file", function(done) {
        compileFile("empty.json", "empty.d.ts", done);
    });

    it("should emit error if the JSON does not have a 'name' member", function(done) {
        var invalidJsonFile = createVinyl("invalid.json");

        var stream = loopbackTs();

        stream.on("error", function(err) {
            err.message.should.equal("Missing model 'name' member.");            
            done();
        });
        stream.write(invalidJsonFile);
        stream.end();
    });

    it("should compile a single simple file", function(done) {
        compileFile("simple.json", "simple.d.ts", done);
    });

    it("should compile multiple files into a single output", function(done) {
        var files = [
            createVinyl("primary-file-id.json"),
            createVinyl("primary-file-injected-id.json"),
            createVinyl("related-file.json")];

        var stream = loopbackTs("combined.d.ts");

        stream.on("data", function(tsdFile) {
            should.exist(tsdFile);
            should.exist(tsdFile.path);
            should.exist(tsdFile.relative);
            should.exist(tsdFile.contents);
            should.equal(path.basename(tsdFile.path), "combined.d.ts");

            String(tsdFile.contents).should.equal(
                fs.readFileSync(path.join(__dirname, 'expected/combined.d.ts'), 'utf-8')
            );            
            
            done();
        });

        files.forEach(function(file) {
            stream.write(file);
        })

        stream.end();
    })

    // it("should compile a file with belongsTo relationships", function(done){
    //     compileFile("belongs-to.json", "belongs-to.d.ts",done);
    // })
})