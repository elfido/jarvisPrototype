var Cast = {
	applicationID: "5584E764",
	isCastReady: false,
	onInitSuccess: function(){
		console.log("Init succeeded");
	},
	onError: function(error){
		console.log("Error found: ");
		console.dir(error);
	},
	sessionUpdateListener: function(e){
		console.dir(e);
	},
	sessionListener: function(session){
		app.session = session;
	},
	receiverListener: function(e){
		if( e === 'available' ) {
			Cast.isCastReady = true;
			console.log("cast is ready");
		}
		else {
			console.log("receiver list empty");
		}
	},
	initCast: function(){
		if (!chrome.cast || !chrome.cast.isAvailable){
			setTimeout(this.initCastAPI.bind(this), 1000);
		}
	},
	initCastAPI: function(){
		var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,this.sessionListener, this.receiverListener);
		chrome.cast.initialize(apiConfig, this.onInitSuccess, this.onError);
	},
	init: function(){
		this.initCast();
	}	
};

$(document).ready(function(){
	Cast.init();
});