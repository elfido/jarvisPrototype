var express = require('express'),
	swig = require('swig'),
	config_package = require("./package.json"),
	appSettings = require("./app-settings.json"),
	morgan = require('morgan'), //logger
	bodyParser = require('body-parser'),
	//express assignment
	app = express(),
	fs = require("fs"),
	DAS = require("./db/das.js"),
	Encoder = require("./lib/encoder.js"),
	_ = require("underscore"),
	Rotten = require('./lib/rotten.js');

var views = [
		{path: "/", html: "index"},
		{path: "/encoder", html: "encoder"},
		{path: "/mediacenter", html: "player"},
		{path: "/movie", html: "movie"},
		{path: "/settings", html: "settings"},
	],
	settings = JSON.parse(fs.readFileSync('/etc/jarvis.json', 'utf-8'));

var queueDAS = new DAS("queue"),
	filesDAS = new DAS("files"),
	encoderDAS = new DAS("encoder"),
	rotten = new Rotten(),
	encoderEngine = new Encoder(settings);

function getUsedSpace(dir, files){
	var files_ = new Array();
	var used = 0;
    if (typeof files_ === 'undefined') files_=[];
    	var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        //var name = dir+'/'+files[i];
        var name = dir+'/'+files[i];
        //var stats = fs.statSync(this.queue[i].target),
		//			fileSizeInBytes = stats["size"];
        if (fs.statSync(name).isDirectory()){
            getFiles(name,files_);
        } else {
        	//name = name.replace(dir, "");
        	var file = {
        		fName: name.replace(dir, ""),
        		fSize: fs.statSync(name)["size"]
        	};
        	used+=file.fSize;
            files_.push(file);
        }
    }
    return used;
}

function getFiles(dir,files_){
    files_ = files_ || [];
    if (typeof files_ === 'undefined') files_=[];
    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        //var name = dir+'/'+files[i];
        var name = dir+'/'+files[i];
        //var stats = fs.statSync(this.queue[i].target),
		//			fileSizeInBytes = stats["size"];
        if (fs.statSync(name).isDirectory()){
            getFiles(name,files_);
        } else {
        	//name = name.replace(dir, "");
        	var fDate = new Date(fs.statSync(name)["ctime"]),
        		fDateStr = fDate.getFullYear()+'/'+(fDate.getMonth()+1)+'/'+fDate.getUTCDate();
        	var file = {
        		fName: name.replace(dir, ""),
        		ctime: fDateStr,
        		cts: new Date(fDate),
        		fSize: fs.statSync(name)["size"]
        	};
            files_.push(file);
        }
    }
    return files_;
}

var encoder = {
	queue: new Array(),
	id: 0,
	addItem: function(item){
		item.processed = false;
		item.id = this.id++;
		item.isProcessing = false;
		item.lastSize = 0;
		this.queue.push(item);
	},
	popById: function(id){
		var size = this.queue.length;
		for (var i=0; i<size; i++){
			if (this.queue[i].id == id)
				this.queue[i].processed = true;
		}
	},
	processById: function(ndx){
		var exec = require('child_process').exec,
		    		child;
		this.queue[ndx].isProcessing = true;
		var item = this.queue[ndx];
		child = exec('encode '+item.source+" "+item.target+" "+item.resolution+" "+item.allowDelete,
			{maxBuffer: (((1024 * 1024)* 1024) * 700)}, function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				console.log(this.id+ " "+this.target + " generated");
		}.bind(item));
	},
	initAPI: function(){
		var _this = this,
		api = "/paos/api",
		fapi = '/fido/api';
		//projects = api + "projects/";
		console.log("Starting API");
		
		app.get(api+'/files', function(req, res){
			filesDAS.findAll({filters:{}, start: 0, pageSize: 10000, sort: 'fName'}, function(error, response){
				res.send(response);
			}, function(){

			});
		});

		app.get(api+'/movies', function(req, res){
			var title = (typeof req.query.title!="undefined") ? req.query.title : 'star wars';
			rotten.getMovies(title ,function(results){
				res.send(results);
			});
		});

		app.get(api+'/files/:id', function(req, res){
			var _id = req.params.id;		
			filesDAS.findById(_id, function(error, response){
				res.send(response);
			}, function(){

			});
		});

		app.put(api+'/files/:id', function(req, res){
			var _id = req.params.id,
				obj = req.body;	
			delete obj._id;
			filesDAS.updateFull(_id, obj, function(err,item){
				res.send(obj);
			}, function(){

			});
		});

		app.get(api+'/queue/available', function(req,res){
			queueDAS.findAll({filters: {status: "available"}, start: 0, pageSize: 10000}, function(error,response){
				res.send(response.items);
			}, function(error){
				console.dir(error);
			});
		});

		app.get(api+'/queue', function(req, res){
			queueDAS.findAll({filters: {status: "new"}, start: 0, pageSize: 10000}, function(error,response){
				res.send(response.items);
			}, function(error){
				console.dir(error);
			});
		});

		app.post(api+'/queue', function(req,res){
			var item = req.body;
			item.position = 0;
			queueDAS.getCount(function(result){
				item.position = result;
				item.status = "new";
				console.log("Adding item to the queue");
				console.dir(item);
				queueDAS.create(item, function(){
					res.send({msg: "Ok"});
				}, function(){
					res.send({error: "wrong!"});
				});
			});
			
		});
	
		app.get(fapi+'/rawVideo', function(req,res){
			var files = getFiles(settings.rawVideo),
				_data = _(files).filter(function(item){
	    			var dotNdx = item.fName.lastIndexOf('.'),
	    				extension = (item.fName.slice(dotNdx+1, item.fName.length)).toLowerCase();
	    			if (extension==="ts" || extension==="mts" || extension==="avi" || extension==="mp4"|| extension==="m2ts" || extension==="mov"){
	    				return(item);
	    			}
    			});
			res.send(_data);
		});				

		app.post(fapi+'/encode', function(req, res){
			var encodeSettings = req.body;
			encodeSettings.status = "new";
			encodeSettings.added = new Date();
			if (encodeSettings.target.toLowerCase().lastIndexOf(".mp4")<1){
				encodeSettings.target = encodeSettings.target + ".mp4"; 
			}
			encoderDAS.create(encodeSettings, function(){
				res.send({msg: "Ok"});
			}, function(){
				res.send({error: "wrong!"});
			});
		});

		app.get(fapi+'/encode', function(req, res){
			encoderDAS.findAll({filters: {status: "new"}, start: 0, pageSize: 10000}, function(error,response){
				res.send(response.items);
			}, function(error){
				console.dir(error);
			});
		});

		app.get(fapi+'/qc', function(req,res){
			var files = getFiles(settings.qc);
			//console.log( files );
			res.send(files);
		});

		app.get(api+'/dir', function(req,res){
			var files = getFiles(settings.source);
			//console.log( files );
			res.send(files);
		});

		app.get(fapi+'/media', function(req,res){
			filesDAS.findAll({filters:{}, start: 0, pageSize: 10000, sort: 'fName'}, function(error, response){
				var _data = _(response.items).filter(function(item){
	    			var dotNdx = item.fName.lastIndexOf('.'),
	    				extension = (item.fName.slice(dotNdx+1, item.fName.length)).toLowerCase();
	    			if (extension==="ts" || extension==="mts" || extension==="avi" || extension==="mp4"|| extension==="m2ts" || extension==="mov"){
	    				return(item);
	    			}
    			});
				res.send(_data);
			}, function(){

			});
		});

		app.get(api+'/about', function (req, res){ 
				res.setHeader('Content-Type', 'application/json');
				res.send( _this.config);
			}
		);
	},
	initViews: function(){
		console.log("Starting UI");
		var _this = this;
		for (var i=0; i<views.length; i++){
			var view = views[i];
			app.get(view.path, function (req, res) {
				res.render(this.html, {} );
			}.bind(view));
		}
	},
	expressSetup: function(){
		morgan(':remote-addr :method :url');
		app.use(bodyParser.urlencoded({ extended: false }));
		app.engine('html', swig.renderFile);
		app.set('view engine', 'html');
		app.set('views', __dirname + '/views');
		app.set('view cache', false);
		swig.setDefaults({ cache: false });
		app.use(express.static(__dirname+'/public'));
	},
	monitor: function(){
		var size = this.queue.length;
		for (var i=0; i<size; i++){
			if (this.queue[i].isProcessing){
				var fs = require("fs");
				if (fs.existsSync(this.queue[i].target)){
					var stats = fs.statSync(this.queue[i].target),
					fileSizeInBytes = stats["size"];
					if (this.queue[i].lastSize == fileSizeInBytes){
						//Processed
						console.log(this.queue[i].target+" finalizado");
						this.queue[i].isProcessing = false;
						this.queue[i].processed = true;
						this.popById(this.queue[i].id);
						if (i<(size-i)){
							this.processById(++this.queue[i].id);
						}
					}
					this.queue[i].lastSize = fileSizeInBytes;
				}
			}
		}
	},
	updateFile: function(){
		var files = getFiles(settings.source);
		for (ndx in files){
			filesDAS.findAll({filters: {fName: files[ndx].fName}, start: 0, pageSize: 1, sort: {fName: 1}}, function(error,response){
				var item = this;
				if (response.count==0){
					item.description = "";
					item.friendlyName = "";
					item.poster = "";
					item.url = "";
					filesDAS.create(item, function(){
						console.log("Created");
					}, function(error){
						console.log("error :(");
					});
				}
			}.bind(files[ndx]), function(error){
				console.dir(error);
			});
		}
	},
	writeJSON: function(){
		filesDAS.findAll({filters:{}, start: 0, pageSize: 10000, sort: 'fName'}, function(error, response){
			fs.writeFile(settings.dest+"/db.json", JSON.stringify(response), function(err){
				if(err) {
					console.log("Error saving the file")
			        console.log(err);
			    } else {
			        //console.log("The file was saved!");
			    }
			});
		}, function(){

		});
	},
	purgeFile: function(){
		//check that everything on the DB exists on the FSs
	},
	purgeMonitor: function(){
		queueDAS.findAll({filters: {status: "available"}, start: 0, pageSize: 10000}, function(error,response){
				var fs = getFiles(settings.dest),
					items = response.items;
				for (ndx in items){
					var fn = items[ndx].name,
						id = items[ndx]._id,
						found = false;
					for (fndx in fs){
						if (fs[fndx].fName == fn)
							found = true;
					}
					if (!found){
						console.log("File "+fn+" has been removed, the queue will be updated. "+id);
						queueDAS.update(id, {status: "removed"}, function(){
							console.log("updated");
						}, function(error){
							console.dir(error);
							console.log("error");
						});
					}
				}
			}, function(error){
				console.dir(error);
			}
		);
		//get all available in db
		//look for them in fs
		//not present? set as purge
	},
	dropboxMonitor: function(){
		var used = getUsedSpace(settings.dest),
			dropbox = settings.dbSize * 1000000,
			available = dropbox - used;
		console.log("Dropbox size: "+ dropbox + " Used: "+used+" Available: "+ available);
		queueDAS.findAll({filters: {status: "new"}, start: 0, pageSize: 1}, function(error,response){
			if (response.count>0){
				var item = response.items[0],
					size = item.size;
				if (size < available){
					console.log("Moving item:" + item.name);
					if (settings.env!="dev"){
						fs.createReadStream(settings.source+item.name).pipe(fs.createWriteStream(settings.dest+item.name));
						queueDAS.update(item._id, {status: "available"}, function(){
							console.log("updated");
						}, function(error){
							console.dir(error);
							console.log("error");
						});
					}			
				}
			}	
		}, function(error){
			//console.dir(error);
		});
	},
	init: function(){
		this.expressSetup();
		this.initAPI();
		this.initViews();
		encoderEngine.start();
		this.config = {
			name: config_package.name,
			version: config_package.version,
			description: config_package.description
		};
		setInterval(this.monitor.bind(this), settings.monitorTimer);
		setInterval(this.dropboxMonitor.bind(this), (1000*60*4) );
		setInterval(this.updateFile.bind(this), (1000*60*5) );
		setInterval(this.writeJSON.bind(this), (10000) );
		setInterval(this.purgeMonitor.bind(this), settings.monitorTimer);
		app.listen(appSettings.serverPort);
		console.log("Encoder ready");
		console.log("Server Port: "+appSettings.serverPort);
		console.log("Environment: "+settings.env);
	}
}

encoder.init();
