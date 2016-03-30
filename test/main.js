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
    
    it("should emit error when file isStream()", function(done){
       var stream = loopbackTs();
       
       var streamFile= {
           "isNull": function(){
               return false;
           },
           "isStream": function(){
               return true;
           }
       } 
       
       stream.on("error", function(err){
           err.message.should.equal("Streaming not supported");
           done();
       });
       
       stream.write(streamFile);
    });
})