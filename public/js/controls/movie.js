function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

Movies = can.Control.extend({
	selectors: {
		movieForm: '.movie'
	},
	_options: {
		key: '7dc953f6a2e5861c8a28a57b82408a2b',
		base: 'https://api.themoviedb.org/3',
		configuration: null
	},
	getConfiguration: function(){
		var _this = this;
		$.ajax({
			url: this._options.base+'/configuration?api_key='+_this._options.key,
			type: 'get',
			success: function(data){
				//console.dir(data);
				_this.configuration = data;
			},
			error: function(error){
				console.log(error);
			}
		});
	},
	".use-movie click": function(element, event){
		event.preventDefault();
		var poster = $(element).parent().children('img').attr('src'),
			title = $(element).parent().children('h4').html();
		console.dir(title);
		$('#poster').val(poster);
		$('#friendlyName').val(title);
	},
	".cmd-search-title click": function(element, event){
		event.preventDefault();
		var title = $('.movie-search-name').val(),
			type = $('.search-type').val(),
			filter = (type=='movie') ? 'movie' : 'tv',
			_this = this,
			mustache = (type == 'movie') ? 'showSearch' : 'tvSearch',
			_url = this._options.base+'/search/'+filter+'?api_key='+this._options.key+'&query='+title;
		$.ajax({
			url: _url,
			type: 'get',
			success: function(data){
				console.dir(data);
				$(".search-results").html( can.view('/js/mustaches/'+mustache, {titles: data.results}) );
				$('.poster-temp').each(function(){
					var src = $(this).data('src'),
					base = _this.configuration.images.base_url.slice(0,_this.configuration.images.base_url.length-1);
					src = base+'/w185'+src;
					$(this).attr('src',src);
				});
			},
			error: function(error){
				console.log('error');
				console.dir(error);
			}
		});
	},
	'.cmd-save click': function(element, event){
		event.preventDefault();
		this.flags.currentMovie.attr('friendlyName', $('#friendlyName').val() );
		this.flags.currentMovie.attr('poster', $('#poster').val() );
		this.flags.currentMovie.attr('runtime', $('#runtime').val() );
		this.flags.currentMovie.attr('raiting', $('#raiting').val() );
		this.flags.currentMovie.attr('description', $('#description').val() );
		this.flags.currentMovie.attr('clasification', $('#clasification').val() );
		this.flags.currentMovie.attr('language', $('#language').val() );
		this.flags.currentMovie.attr('genre', $('#genre').val() );
		this.flags.currentMovie.save(function(){
			alert('Item updated');
		}, function(error){
			alert('Error');
			console.dir(error);
		});
	},
	loadMovie: function(id){
		var _this = this;
		Models.Movies.findOne({id: id}, function(movie){
			//console.dir(_this.configuration);
			$(_this.selectors.movieForm).html( can.view('/js/mustaches/movieEditor', {movie: movie, configuration: _this.configuration}) );
			_this.flags = {};
			_this.flags.currentMovieId = id;
			movie.attr('id',id);
			movie.attr('_id',id);
			_this.flags.currentMovie = movie;
			console.dir(movie);
		});
	},
	init: function(element){
		var id = getParameterByName('id');
		this._options.id = id;
		this.loadMovie(id);
		this.getConfiguration();
	}
});

var movies = new Movies('body');