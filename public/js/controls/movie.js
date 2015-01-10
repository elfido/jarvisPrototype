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
			$(_this.selectors.movieForm).html( can.view('/js/mustaches/movieEditor', {movie: movie}) );
			_this.flags = {};
			_this.flags.currentMovieId = id;
			_this.flags.currentMovie = movie;
		});
	},
	init: function(element){
		var id = getParameterByName('id');
		this.loadMovie(id);
	}
});

var movies = new Movies('body');