MediaCenter = can.Control.extend({
	selectors: {
		mediaList: '.video-list'
	},
	loadCloud: function(){
		var _this = this;
		Models.Media.findAll({}, function(files){
			files = _(files).sortBy(function(item){
				if (item.friendlyName.length>0)
					return(item.friendlyName.toLowerCase());
				else
					return(item.fName.toLowerCase());
			});
			$(_this.selectors.mediaList).html( can.view('/js/mustaches/mediaCenter', {files: files}) );
		},function(error){
			console.dir(error);
			console.log('error');
		});
	},
	init: function(element){
		this.loadCloud();
	}
});

var mediaCenter = new MediaCenter('body');