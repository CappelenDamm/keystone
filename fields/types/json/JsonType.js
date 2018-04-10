var _ = require('underscore');
var FieldType = require('../Type');
var TextType = require('../text/TextType');
var util = require('util');
var utils = require('keystone-utils');


/**
 * HTML FieldType Constructor
 * @extends Field
 * @api public
 */
function json(list, path, options) {
	this._nativeType = Object;
	this._defaultSize = 'full';
	this.height = options.height || 180;
    this.objectType = options.objectType;
    this.aux = options.aux;
	this._properties = ['height', 'objectType', 'aux'];
	json.super_.call(this, list, path, options);
}
util.inherits(json, FieldType);

/* Inherit from TextType prototype */
json.prototype.addFilterToQuery = TextType.prototype.addFilterToQuery;


json.prototype.getValueFromData = function(data, canThrow) {
	var value = this.path in data ? data[this.path] : this._path.get(data);

	if(typeof value == 'string') {
		try {
			value = JSON.parse(value);
		} catch(ex) {
			if(canThrow === true) {
				throw ex;
			} else {
				value = null;
			}
		}
	}

	return value;
};

json.prototype.validateRequiredInput = function (item, data, callback) {
	var value = this.getValueFromData(data);
	var result = !!value;
	if (value === undefined && item.get(this.path)) {
		result = true;
	}
	utils.defer(callback, result);
};

json.prototype.validateInput = function (data, callback)  {
	try {
		let value = this.getValueFromData(data, true);

		if(typeof value != 'object') {
			result = false;
		} else {
			result = true;
		}
	} catch(ex) {
		result = false;
	}

    utils.defer(callback, result);
};


/* Export Field Type */
exports = module.exports = json;
