/**
 * Controller for an object block bottom of the screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
var OBJECT_DETAILS = require("models/ca-object-details")();
var COMMONS = require("ca-commons");

// Fixing the table we"re working on, eventually to come through CONFIG after
$.TABLE = "ca_objects";

$.init = function() {
	APP.openLoading();
	
	APP.log("debug","Adding folder block ("+CONFIG.object_id+")");
	$.objectInfo.text = CONFIG.idno;
	$.objectName.text = CONFIG.display_label;

	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.url = APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.object_id);
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;

	OBJECT_DETAILS.init($.TABLE,CONFIG.object_id);
	$.retrieveData();
}

$.retrieveCallbackFunctions = function() {
	$.handleData(OBJECT_DETAILS.getMainObjectInfo(CONFIG.object_id));
}

$.retrieveData = function() {
	Ti.API.log("debug","APP.authString " + APP.authString);

	// Handling breadcrumb
	if(COMMONS.isCacheValid(CONFIG.url,CONFIG.validity)) {
		APP.log("debug","ca-objects-details cache is valid");
		$.retrieveCallbackFunctions();
	} else {
		OBJECT_DETAILS.fetch({
				url: CONFIG.url,
				authString: APP.authString,
				cache: 0,
				callback: function() {
					$.retrieveCallbackFunctions();
					
					if(typeof _callback !== "undefined") {
						_callback();
					}
				},
				error: function() {
				/*	APP.closeLoading();
					var dialog = Ti.UI.createAlertDialog({
					    message: 'Connexion failed. Please retry.',
					    ok: 'OK',
					    title: 'Error'
					  }).show();
					if(typeof _callback !== "undefined") {
						_callback();
					}*/
					Ti.API.log("debug","OBJECT_DETAILS.fetch crashed :-(");
				}
		});
	}
	APP.closeLoading();
}

$.handleData = function(_data) {
	
	if(_data.thumbnail_url) {
		APP.log("debug",_data.thumbnail_url);
		var file=COMMONS.getRemoteFile(_data.thumbnail_url);
		APP.log("debug",file);
		$.cellimage.image = file;
	}
	$.objectInfo.text = _data.idno;
}

$.cellimage.addEventListener('click',function(e) {
	APP.openLoading();
	APP.log("debug", "adding new child (main.js): "+CONFIG.object_id);
	var child_info = {
		id: CONFIG.object_id,
		display_label: CONFIG.display_label
	}
	APP.addChild("main", child_info, false, false);
	APP.breadcrumb.push(child_info);
});

$.init();
