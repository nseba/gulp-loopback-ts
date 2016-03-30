var should = require('should');
var fs = require('fs');
var loopbackTs = require("../index");
require("mocha");

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
    });
    
    // it('Generates a file with the same name as the input and the extension .d.ts', function() {

    // })
})