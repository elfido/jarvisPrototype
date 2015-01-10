/**
* Generic Data Access Services - MongoDB
**/

var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

errorMessages = {
	NO_COLLECTION_DEFINED: "No collection defined"
}

function DAS(collection){
	this.collection = collection;
	this.server = new Server('localhost', 27017, { auto_reconnect: true});
	this.db = new Db('paos',this.server);
	this.db.open(function(err, db){

	});	
	this.DASConfig = {
		name: "",
		collection: collection,
		allowExtendModel: false,
		maxPageSize: 10
	}
};

DAS.prototype.findById = function(id, callback, errorCallback){
	if (this.DASConfig.collection!=null){
		this.db.collection(this.DASConfig.collection, function(err, collection){
			if (err){
				if (typeof errorCallback != 'undefined')
					errorCallback(err);
			} else{
				var itemId;
				try{
					itemId = new BSON.ObjectID(id);
					collection.findOne({'_id': itemId}, function(err,item){
						if (err){
							if (typeof errorCallback != 'undefined')
								errorCallback(err);
						}
						callback(err, item);
					});
				} catch(ex){
					errorCallback(ex);
				}
			}
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}
}

DAS.prototype.getCount = function(callback){
	if (this.DASConfig.collection!=null){
		this.db.collection(this.DASConfig.collection, function(err, collection){
			collection.count({status: "new"},function(err,result){
				callback(result);
			});
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}	
}

DAS.prototype.findAll = function(options, callback, errorCallback){
	if (this.DASConfig.collection!=null){
		var sortOptions = (typeof options.sort!= "undefined") ? options.sort : {};
		this.db.collection(this.DASConfig.collection, function(err, collection){
			collection.count(options.filters,function(err,result){
				collection.find(options.filters).sort(sortOptions).skip(options.start).limit(options.pageSize).toArray(function(err,itemset){
					var response = {
						count: result,
						items: itemset
					};
					callback(err,response);
				});
			});
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}	
}

DAS.prototype.create = function(item,callback,errorCallback){
	if (this.DASConfig.collection!=null){
		if (typeof item._id != "undefined"){
			delete item._id;
		}
		this.db.collection(this.DASConfig.collection, function(err, collection){
			if (err){
				console.dir(err);
			} else{				
				collection.insert(item, {safe: true}, callback);
			}
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}
};

DAS.prototype.update = function(id, item, callback, errorCallback){
	if (this.DASConfig.collection!=null){
		this.db.collection(this.DASConfig.collection, function(err, collection){
			if (err){
				if (typeof errorCallback != 'undefined')
					errorCallback(err);
			} else{
				try{
					console.dir(item);
					itemId = new BSON.ObjectID(id);
					collection.update({'_id': itemId}, {$set:item}, function(err,item){
						if (err){
							if (typeof errorCallback != 'undefined')
								errorCallback(err);
						}
						console.log(id);
						console.dir(item);	
						callback(err, item);
					});
				} catch(ex){
					errorCallback(ex);
				}
			}
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}
}

DAS.prototype.updateFull = function(id, item, callback, errorCallback){
	if (this.DASConfig.collection!=null){
		this.db.collection(this.DASConfig.collection, function(err, collection){
			if (err){
				if (typeof errorCallback != 'undefined')
					errorCallback(err);
			} else{
				try{
					console.dir(item);
					itemId = new BSON.ObjectID(id);
					collection.findAndModify({'_id': itemId}, [],item,{}, function(err,item2){
						if (err){
							if (typeof errorCallback != 'undefined')
								errorCallback(err);
						}
						console.dir(id);
						console.dir(item);
						console.dir(item2);	
						callback(err, item2);
					});
				} catch(ex){
					errorCallback(ex);
				}
			}
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}
}

DAS.prototype.remove = function(item,callback,errorCallback){
	var itemId = new BSON.ObjectID(item._id);
	if (this.DASConfig.collection!=null){
		db.collection(this.DASConfig.collection, function(err, collection){
			if (err){
				console.dir(err);
			} else{				
				collection.remove({'_id': itemId}, {safe: true}, callback);
			}
		});
	} else{
		errorCallback(getErrorMessage(errorMessages.NO_COLLECTION_DEFINED));
	}
};

module.exports = DAS;