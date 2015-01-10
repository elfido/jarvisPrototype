var rottenKey = "err2r5n2fzymcfj9kgjeba83";

var Client = require('node-rest-client').Client;

client = new Client();

function Rotten(){

}

Rotten.prototype.getMovies = function(movie, callback){
	var url = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?q='+movie+'&page_limit=10&page=1&apiKey='+rottenKey;
	
	client.get(url, function(data,response){
		var results = data;
		callback(results);
	});
}

module.exports = Rotten;