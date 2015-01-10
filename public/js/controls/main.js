Manager = can.Control.extend({
	".btn-rotten click": function(element, event){
		event.preventDefault();
		var id = $(element).data('file');
		this.currentFileId = id;
		$('.file-id').html(id);
		$('.rotten-search').val( $(element).data('name') );
	},
	".rotten-info click": function(element, event){
		var title = $(element).data('name'),
			poster = $(element).data('poster'),
			description = $(element).data('description'),
			runtime = $(element).data('runtime'),
			raiting = $(element).data('raitings'),
			_this = this;
		$.ajax({
			url: '/paos/api/files/'+this.currentFileId,
			method: 'get',
			success: function(_data){
				_data.friendlyName = title;
				_data.poster = poster;
				_data.description = description;
				_data.runtime = runtime;
				_data.raiting = raiting;
				$.ajax({
					data: _data,
					method: 'put',
					url: '/paos/api/files/'+_this.currentFileId,
					dataType: 'json',
					success: function(){
						alert('Item updated');
					},
					error: function(error){
						alert('Error');
						console.dir(error);
					}
				});
			}
		});
	},
	".edit-item click": function(element, event){
		var id = $(element).data('id');
		$.ajax({
			url: '/paos/api/files/'+id,
			method: 'get',
			success: function(data){
				$('.title-editor').show();
				$('.title-editor').html( can.view('/js/mustaches/movieEditor.mustache', {movie: data}) );
			}
		});
	},
	".btn-cancel click": function(element, event){
		$('.title-editor').hide();
	},
	"form submit": function(element, event){
		event.preventDefault();
	},
	".search-movie click": function(element, event){
		event.preventDefault();
		var title = $('.rotten-search').val(),
			selector = '.rotten-results';
		$.ajax({
			url: '/paos/api/movies?title='+title,
			dataType: 'json',
			success: function(data){
				$(selector).html('');
				_(data.movies).each(function(item){
					can.view('/js/mustaches/movie.mustache', {movie: item}, function(view){
						$(selector).append( view );
					});
				});
			}
		});
	},
	loadEditGrid: function(){
		$.ajax({
			url: '/paos/api/files',
			method: 'GET',
			success: function(response){
				var data = response.items;
				data = _(data).sortBy(function(item){
					return( item.fName.toString().toLowerCase() );
				});
				$(".edit-grid").html( can.view('/js/mustaches/editGrid.mustache', {movies: data}) );
			}
		});
	},
	loadCloud: function(){
		$.ajax({
			url: '/paos/api/files',
			method: 'get',
			success: function(data){
				var movies = _(data.items).filter(function(item){
					if (item.fName!="/.DS_Store")
						return(item);
				});
				$('.cloud-list').html( can.view('/js/mustaches/cloud.mustache', {files: movies}) );
			}
		});
	},
	init: function(element){
		this.loadCloud();
		this.loadEditGrid();
		setInterval(function(){
			this.loadCloud();
		}.bind(this), 30000);	
	}
});

var manager = new Manager('body');