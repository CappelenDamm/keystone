var crypto = require('crypto');
var FieldType = require('../Type');
var TextType = require('../text/TextType');
var util = require('util');
var utils = require('keystone-utils');
var Vimeo = require('vimeo');
/**
 * Email FieldType Constructor
 * @extends Field
 * @api public
 */
function vimeo (list, path, options) {
	this._nativeType = String;
	this._underscoreMethods = ['gravatarUrl'];
	this.typeDescription = 'email address';
	vimeo.super_.call(this, list, path, options);
}
vimeo.properName = 'Vimeo';
util.inherits(vimeo, FieldType);

/* Inherit from TextType prototype */
vimeo.prototype.addFilterToQuery = TextType.prototype.addFilterToQuery;

/**
 * Generate a gravatar image request url
 */
vimeo.prototype.gravatarUrl = function (item, size, defaultImage, rating) {
	var value = item.get(this.path);
	if (typeof value !== 'string') {
		return '';
	}
	return [
		// base url protocol-less for both http/https
		'//www.gravatar.com/avatar/',
		// md5 hash the trimmed lowercase email
		crypto.createHash('md5').update(value.toLowerCase().trim()).digest('hex'),
		// size of images ranging from 1 to 2048 pixels, square
		'?s=' + (/^(?:[1-9][0-9]{0,2}|1[0-9]{3}|20[0-3][0-9]|204[0-8])$/.test(size) ? size : 80),
		// default image url encoded href or one of the built in options: 404, mm, identicon, monsterid, wavatar, retro, blank
		'&d=' + (defaultImage ? encodeURIComponent(defaultImage) : 'identicon'),
		// rating, g, pg, r or x
		'&r=' + (/^(?:g|pg|r|x)$/i.test(rating) ? rating.toLowerCase() : 'g'),
	].join('');
};

/**
 * Asynchronously confirms that the provided email is valid
 */
vimeo.prototype.validateInput = function (data, callback) {
	var input = this.getValueFromData(data);
	var result = true;
	if (input) {
		result = utils.isEmail(input);
	}
	utils.defer(callback, result);
};

/**
 * Asynchronously confirms that required input is present
 */
vimeo.prototype.validateRequiredInput = TextType.prototype.validateRequiredInput;

/**
 * Validates that a valid email has been provided in a data object
 *
 * Deprecated
 */
vimeo.prototype.inputIsValid = function (data, required, item) {
	var value = this.getValueFromData(data);
	if (value) {
		return utils.isEmail(value);
	} else {
		return (!required || (item && item.get(this.path))) ? true : false;
	}
};

/**
 * Updates the value for this field in the item from a data object
 * Ensures that the email address is lowercase
 */

vimeo.prototype.upload = function(f) {
	var CLIENT_ID = '46326064b76e3b25a60e1bcc22839cbfb754ee99';
	var CLIENT_SECRET = '9hXDHqIcBe1/Yj4jE+MR4OBUCKZEsLbneZbzHVU0fTa5rIHs8PQ4sWYVCtaoc9AiWwzcWWm5pgSyuc0attWvw4jNR0sGZBqQEQhgr14efAKq5fj/Jnq1lhpbvK8h6EMb';
	var ACCESS_TOKEN = 'bea069a91694bd0c6540f323ad5e8e9f';
	var lib = new Vimeo.Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);
	//var url = lib.buildAuthorizationEndpoint('http://localhost:3000/foo', ['upload'], 'foo');
	let file = 'data/files/' + f;
	console.log('file', file);

	lib.streamingUpload('data/files/' + file,  function (error, body, status_code, headers) {
	 if (error) {
			 throw error;
	 }

	 lib.request(headers.location, function (error, body, status_code, headers) {
			 console.log(body);
			 let html = body.embed.html;
			 let uri = body.uri;
	 		 item.set(this.path, {
				  file: file,
				  embed: html,
					uri: uri
			 });
			 process.nextTick(callback);
	 });
	 }, function (upload_size, file_size) {
			 console.log("You have uploaded " + Math.round((upload_size/file_size) * 100) + "% of the video");
 });
},

vimeo.prototype.updateItem = function (item, data, callback) {
	let newValue = null;
	console.log('item', item);
	/*
	if (data.vimeoFile && data.vimeoFile.fileName) {
		var value = this.getValueFromData(data);
		if (!value || value.file != data.vimeoFile.fileName) {
			this.upload(data.vimeoFile.fileName);
		} else {
				process.nextTick(callback);
		}
	} else {
		item.set(this.path, null);
		process.nextTick(callback);
	}
	*/
	process.nextTick(callback);


};

/* Export Field Type */
module.exports = vimeo;
