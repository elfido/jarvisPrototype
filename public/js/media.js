var app = {
	s: {
		messageContainer: "#messageContainer"
	},
	session: null,
	log: function(msg){
		console.log(msg);
		$(this.s.messageContainer).append(msg+"<br/>");
	},
	clear: function(){
		$(this.s.messageContainer).html("");
	},
	onRequestSessionSuccess: function(session){
		app.log("Session success");
		app.session = session;
	},
	onMediaError: function(error){
		app.log("onMediaError "+error.code);
	},
	onMediaDiscovered: function(media) {
   		currentMedia = media;
	},
	onLaunchError: function(error){
		app.log("Error: "+error.description);
	},
	loadResource: function(mediaType,resource){
		var mediaInfo = new chrome.cast.media.MediaInfo(resource),
		request = new chrome.cast.media.LoadRequest(mediaInfo);
		mediaInfo.contentType = mediaType;
		app.session.loadMedia(request, app.onMediaDiscovered.bind(app.session.loadMedia), app.onMediaError);
		if (app.session.media.length != 0) {
			app.onMediaDiscovered('onRequestSessionSuccess', app.session.media[0]);
		}
	},
	loadPicture: function(image){
		app.loadResource("image/jpg",image);
	},
	loadVideo: function(video){
		app.loadResource("video/mp4",video);
	}
};

$("#cmdStart").click(function(){
	console.log("try");
	if (Cast.isCastReady){
		chrome.cast.requestSession(app.onRequestSessionSuccess, app.onLaunchError);
	} else{
		app.log("Not yet");
	}
});

$(".cmdPlayVideo").click(function(){
	//app.loadVideo("file:///Volumes/Paola/Peliculas/Free.Birds.2013.720p.BluRay.x264.YIFY.mp4");
	var video = $(this).data('video');
	app.loadVideo(video);
	//app.loadVideo("http://techslides.com/demos/sample-videos/small.mp4");
});

$("#cmdLoadPicture").click(function(){
	app.loadPicture("https://farm8.staticflickr.com/7174/13660138413_a7da4f8db9_o_d.jpg");
});

$("#cmdClear").click(app.clear.bind(app));