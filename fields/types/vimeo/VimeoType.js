var crypto = require('crypto');
var FieldType = require('../Type');
var TextType = require('../text/TextType');
var util = require('util');
var utils = require('keystone-utils');
var Vimeojs = require('vimeo');
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

vimeo.prototype.upload = function() {
	 var CLIENT_ID = '46326064b76e3b25a60e1bcc22839cbfb754ee99';
	 var CLIENT_SECRET = '9hXDHqIcBe1/Yj4jE+MR4OBUCKZEsLbneZbzHVU0fTa5rIHs8PQ4sWYVCtaoc9AiWwzcWWm5pgSyuc0attWvw4jNR0sGZBqQEQhgr14efAKq5fj/Jnq1lhpbvK8h6EMb';
	 var ACCESS_TOKEN = 'https://api.vimeo.com/oauth/access_token';
	 var lib = new Vimeojs(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);
	 lib.generateClientCredentials(['upload'], function (err, access_token) {
			if (err) {
							throw err;
			}

			var token = access_token.access_token;
			console.log('token', token);
			// Other useful information is included alongside the access token
			// We include the final scopes granted to the token. This is important because the user (or api) might revoke scopes during the authentication process
			var scopes = access_token.scope;
	});
 },

vimeo.prototype.updateItem = function (item, data, callback) {
	this.upload();
	var newValue = this.getValueFromData(data);
	if (typeof newValue === 'string') {
		newValue = newValue.toLowerCase();
	}
	if (newValue !== undefined && newValue !== item.get(this.path)) {
		item.set(this.path, newValue);
	}
	process.nextTick(callback);
};

/* Export Field Type */
module.exports = vimeo;
