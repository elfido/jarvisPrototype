var _ = require("underscore"),
    DAS = require("../db/das.js");

var encoderDAS = new DAS("encoder"),
    settings = {},
    globalIsProcessing = false;

function Encoder(config){
    console.dir(config);
    this.config = config;
    settings = config;
    this.flags = {
        isProcessing: false
    }
}

Encoder.prototype.findNext = function(){
    var _this = this;
    encoderDAS.findAll({filters: {status: "new"}, start: 0, pageSize: 1}, function(error,response){
        var item = (response.count>0) ? response.items[0] : null;
        if (item == null){
            globalIsProcessing = false;
        } else{
            console.log("Encoding process starting for item")
            console.dir(item);
            _this.process(item);
        }
    }, function(error){
        console.dir(error);
    });
}

Encoder.prototype.start = function(){
    console.log("starting");
    //console.dir(this);
}

Encoder.prototype.process = function(item){
    var exec = require('child_process').exec,
        child,
        time = (item.duration.length>0) ? (' -t '+item.duration+' '): '',
        command = '/home/fido/ffmpeg/ffmpeg -i '+settings.rawVideo + item.source+' -vcodec libx264 -qscale:v '+item.quality+' -codec:a aac -strict -2 -s '+item.resolution+time+' '+settings.qc+item.target+' -loglevel -8';
        console.log(command);
       // console.dir(settings);
    //this.queue[ndx].isProcessing = true;
    //var item = this.queue[ndx];
    child = exec(command,
        {maxBuffer: (((1024 * 1024)* 1024) * 700)}, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            if (error !== null) {
                console.dir(error);
                console.dir(stderr);
                console.log('exec error: ' + error);
            }
            console.log(this.target + " generated");
            Encoder.removeItem(item);
            globalIsProcessing = false;
    }.bind(item));
}

Encoder.removeItem = function(item){
    console.log('Removing item '+item._id);
    encoderDAS.update(item._id, {status: "removed"}, function(){
        console.log("Encoder item updated");
    }, function(error){
        console.dir(error);
        console.log("error");
    });
}

Encoder.check = function(){
        if (globalIsProcessing == false){
            globalIsProcessing = true;
            this.prototype.findNext();
        } else{
            //console.log("we are busy");
        }
        //this.prototype.start();
}

var timer = setInterval(function(){
    console.log("check "+globalIsProcessing); 
    this.check();
    //console.dir(this.prototype);
}.bind(Encoder), 3000);

module.exports = Encoder;