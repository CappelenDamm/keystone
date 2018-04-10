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

json.prototype.validateRequiredInput = function (item, data, callback) {
	var value = this.getValueFromData(data);
	var result = value != null;
	if (value === undefined && item.get(this.path) != null) {
		result = true;
	}
	utils.defer(callback, result);
};

json.prototype.validateInput = function (data, callback)  {
    let result = false;
	try {
		let value = this.getValueFromData(data);
        JSON.parse(JSON.stringify(value));
        result = true
        // result = JSON.stringify(value) == JSON.stringify(JSON.parse(JSON.stringify(value)));
	} catch(ex) {
		result = false;
	}

    utils.defer(callback, result);
};


/* Export Field Type */
exports = module.exports = json;
