Encoder = can.Control.extend({
	_options: {
		ajaxTimer: 10000
	},
	selectors: {
		qc: '.qc-list',
		rawVideoList: '.raw-video-list',
		queueVideoList: '.queue-video-list',
		sourceName: '.source-fn',
		targetName: '.target-fn',
		resolution: '#resolution',
		quality: '#quality',
		duration: '#duration'
	},
	"#resolution change": function(){
		this.updateStats();
	},
	"#quality change": function(){
		this.updateStats();
	},
	".raw-video-item click": function(element, event){
		event.preventDefault();
		var fn = $(element).data('file');
		$(this.selectors.sourceName).val( fn );
	},
	".encode-item click": function(element, event){
		event.preventDefault();
		var _this = this,
			encodeSettings = {
				source: $(this.selectors.sourceName).val(),
				target: $(this.selectors.targetName).val(),
				resolution: $(this.selectors.resolution).val(),
				quality: $(this.selectors.quality).val(),
				duration: $(this.selectors.duration).val()
			};
		if (encodeSettings.source.length>0 && encodeSettings.target.length>0){
			var encodeItem = new Models.Encoder();
			encodeItem.attr("source", encodeSettings.source);
			encodeItem.attr("target", encodeSettings.target);
			encodeItem.attr("resolution", encodeSettings.resolution);
			encodeItem.attr("quality", encodeSettings.quality);
			encodeItem.attr("duration", encodeSettings.duration);
			encodeItem.save(function(response){
				_this.cleanForm();
				console.log("Processing");
			}, function(error){
				console.dir(error);
			});
		} else{
			alert('Invalid target name');
			console.dir(encodeSettings);
		}
	},
	cleanForm: function(){
		$(this.selectors.sourceName).val('');
		$(this.selectors.duration).val('');
	},
	updateStats: function(){
		var stats = {
			hd720: {
				"10": 650,
				"8": 750,
				"6": 950,
				"4": 1450,
				"2": 2800,
				"1": 5600
			},
			hd1080: {
				8: 1450,
				4: 2950,
				2: 6000,
				1: 12000
			}
		},
		quality = $(this.selectors.quality).val(),
		resolution = $(this.selectors.resolution).val(),
		estimate = 'unknown';
		if (resolution == "hd1080"){
			if (typeof stats.hd1080[quality]!="undefined")
				estimate = stats.hd1080[quality];
		} else{
			if (typeof stats.hd720[quality]!="undefined")
				estimate = stats.hd720[quality];
		}
		$('.length-stats').html(quality + " = " + estimate);
	},
	".rotten-info click": function(element, event){
		/*var title = $(element).data('name'),
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
		});*/
	},
	".edit-item click": function(element, event){
		/*var id = $(element).data('id');
		$.ajax({
			url: '/paos/api/files/'+id,
			method: 'get',
			success: function(data){
				$('.title-editor').show();
				$('.title-editor').html( can.view('/js/mustaches/movieEditor.mustache', {movie: data}) );
			}
		});*/
	},
	".btn-cancel click": function(element, event){
		//$('.title-editor').hide();
	},
	"form submit": function(element, event){
		event.preventDefault();
	},
	".search-movie click": function(element, event){
		/*event.preventDefault();
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
		});*/
	},
	loadEditGrid: function(){
		/*$.ajax({
			url: '/paos/api/files',
			method: 'GET',
			success: function(response){
				var data = response.items;
				data = _(data).sortBy(function(item){
					return( item.fName.toString().toLowerCase() );
				});
				$(".edit-grid").html( can.view('/js/mustaches/editGrid.mustache', {movies: data}) );
			}
		});*/
	},
	loadCloudRaw: function(){
		var _this = this;
		Models.RawVideo.findAll({}, function(files){
			$(_this.selectors.rawVideoList).html( can.view('/js/mustaches/rawVideo', {files: files}) );
		});
	},
	loadQueue: function(){
		var _this = this;
		Models.Encoder.findAll({}, function(files){
			$(_this.selectors.queueVideoList).html( can.view('/js/mustaches/encodeQueue', {files: files}) );
		});	
	},
	loadQc: function(){
		var _this = this;
		Models.QC.findAll({}, function(files){
			$(_this.selectors.qc).html( can.view('/js/mustaches/qc', {files: files}) );
		});	
	},
	init: function(element){
		this.loadCloudRaw();
		this.loadQueue();
		this.loadQc();
		this.updateStats();
		setInterval(function(){
			this.loadCloudRaw();
			this.loadQueue();
			this.loadQc();
		}.bind(this), this._options.ajaxTimer);
		/*this.loadEditGrid();
		setInterval(function(){
			this.loadCloud();
		}.bind(this), 30000);*/
	}
});

var encoder = new Encoder('body');