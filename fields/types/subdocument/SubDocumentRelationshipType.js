var _ = require('lodash');
var FieldType = require('../Type');
var keystone = require('../../../');
var util = require('util');
var utils = require('keystone-utils');
var definePrototypeGetters = require('../../utils/definePrototypeGetters');

/**
 * SubDocumentRelationship FieldType Constructor
 * @extends Field
 * @api public
 */
function subDocumentRelationship (list, path, options) {
	this.many = (options.many) ? true : false;
	this.filters = options.filters;
	this.createInline = (options.createInline) ? true : false;
	this._defaultSize = 'full';
	this.refSchema = options.refSchema;
	this._nativeType = options.refSchema;
	this._underscoreMethods = ['format', 'getExpandedData'];
    this.aux = options.aux;
	this._properties = ['isValid', 'many', 'filters', 'createInline', 'aux'];
	subDocumentRelationship.super_.call(this, list, path, options);
}
subDocumentRelationship.properName = 'SubDocumentRelationship';
util.inherits(subDocumentRelationship, FieldType);

/**
 * Get client-side properties to pass to react field.
 */
subDocumentRelationship.prototype.getProperties = function () {
	var refList = this.refList;
	return {
		refList: {
			singular: refList.singular,
			plural: refList.plural,
			path: refList.path,
			key: refList.key,
		},
	};
};

/**
 * Gets id and name for the related item(s) from populated values
 */

function expandRelatedItemData (item) {
	if (!item || !item.id) return undefined;
	return {
		id: item.id,
		name: this.refList.getDocumentName(item),
	};
}

function truthy (value) {
	return value;
}

subDocumentRelationship.prototype.getExpandedData = function (item) {
	var value = item.get(this.path);
	if (this.many) {
		if (!value || !Array.isArray(value)) return [];
		return value.map(expandRelatedItemData.bind(this)).filter(truthy);
	} else {
		return expandRelatedItemData.call(this, value);
	}
};

/**
 * Registers the field on the List's Mongoose Schema.
 */
subDocumentRelationship.prototype.addToSchema = function (schema) {
	var field = this;
	var def = {
		type: this._nativeType,
		ref: this.options.ref,
		index: (this.options.index ? true : false),
		required: (this.options.required ? true : false),
		unique: (this.options.unique ? true : false),
	};
	this.paths = {
		refList: this.options.refListPath || this.path + 'RefList',
	};
	schema.path(this.path, this.many ? [def] : def);
	schema.virtual(this.paths.refList).get(function () {
		return keystone.list(field.options.ref);
	});
	this.bindUnderscoreMethods();
};

/**
 * Gets the field's data from an Item, as used by the React components
 */
subDocumentRelationship.prototype.getData = function (item) {
	var value = item.get(this.path);
	if (this.many) {
		return Array.isArray(value) ? value : [];
	} else {
		return value;
	}
};

/**
 * Add filters to a query
 */
subDocumentRelationship.prototype.addFilterToQuery = function (filter) {
	var query = {};
	if (!Array.isArray(filter.value)) {
		if (typeof filter.value === 'string' && filter.value) {
			filter.value = [filter.value];
		} else {
			filter.value = [];
		}
	}
	if (filter.value.length) {
		query[this.path] = (filter.inverted) ? { $nin: filter.value } : { $in: filter.value };
	} else {
		if (this.many) {
			query[this.path] = (filter.inverted) ? { $not: { $size: 0 } } : { $size: 0 };
		} else {
			query[this.path] = (filter.inverted) ? { $ne: null } : null;
		}
	}
	return query;
};

/**
 * Formats the field value
 */
subDocumentRelationship.prototype.format = function (item) {
	var value = item.get(this.path);
	// force the formatted value to be a string - unexpected things happen with ObjectIds.
	return this.many ? value.map(value => JSON.stringify(value)).join(', ') : (value || '') + '';
};

/**
 * Asynchronously confirms that the provided value is valid
 *
 * TODO: might be a good idea to check the value provided looks like a MongoID
 * TODO: we're just testing for strings here, so actual MongoID Objects (from
 * mongoose) would fail validation. not sure if this is an issue.
 */
function validateValue(value){
	return typeof value === "object" && value.__t;
}
subDocumentRelationship.prototype.validateInput = function (data, callback) {
	var value = this.getValueFromData(data);
	var result = false;
	if (value === undefined || value === null || value === '') {
		result = true;
	} else {
		if (this.many) {
			if (!Array.isArray(value)) {
				value = [value];
			}
			if (Array.isArray(value)) {
				result = value.every(validateValue);
			}
		} else {
			result = validateValue(value);
		}
	}
	utils.defer(callback, result);
};

/**
 * Asynchronously confirms that the provided value is present
 */
subDocumentRelationship.prototype.validateRequiredInput = function (item, data, callback) {
	var value = this.getValueFromData(data);
	var result = false;
	if (value === undefined) {
		if (this.many) {
			if (item.get(this.path).length) {
				result = true;
			}
		} else {
			if (item.get(this.path)) {
				result = true;
			}
		}
	} else if (this.many) {
		if (!Array.isArray(value)) {
			value = [value];
		}
		if (Array.isArray(value) && value.length) {
			result = value.some(validateValue);
		}
	} else {
		if (value) {
			result = validateValue(value);
		}
	}
	utils.defer(callback, result);
};

/**
 * Validates that a value for this field has been provided in a data object
 *
 * Deprecated
 */
subDocumentRelationship.prototype.inputIsValid = function (data, required, item) {
	if (!required) return true;
	if (!(this.path in data) && item && ((this.many && item.get(this.path).length) || item.get(this.path))) return true;
	if (typeof data[this.path] === 'string') {
		return (data[this.path].trim()) ? true : false;
	} else {
		return (data[this.path]) ? true : false;
	}
};

/**
 * Updates the value for this field in the item from a data object.
 * Only updates the value if it has changed.
 * Treats an empty string as a null value.
 * If data object does not contain the path field, then leave the field untouched.
 * falsey values such as `null` or an empty string will reset the field
 */

subDocumentRelationship.prototype.updateItem = function (item, data, callback) {

	var value = this.getValueFromData(data);
	if (value === undefined) {
		return process.nextTick(callback);
	}

	// Are we handling a many relationship or just one value?
	if (this.many) {
		if(!Array.isArray(value)){
			_new = [value];
		}
		var _old = item.get(this.path);
		
		if (!_.isEqual(_old, _new)) {
			item.set(this.path, _new);
		}
	} else {
		// Ok, it's one value, should I do anything with it?
		if (value && !_.isEqual(value,item.get(this.path))) {
			// If it's set and has changed, I do.
			item.set(this.path, value);
		} else if (!value && item.get(this.path)) {
			// If it's not set and it was set previously, I need to clear.
			item.set(this.path, null);
		}
		// Otherwise, ignore.
	}
	process.nextTick(callback);
};

definePrototypeGetters(subDocumentRelationship, {
	// Returns true if the subDocumentRelationship configuration is valid
	isValid: function () {
		return (
			(keystone.list(this.options.ref) ? true : false)
		)
	},
	// Returns the Related List
	refList: function () {
		return keystone.list(this.options.ref);
	},
	// Whether the field has any filters defined
	hasFilters: function () {
		return (this.filters && _.keys(this.filters).length);
	},
});

/* Export Field Type */
module.exports = subDocumentRelationship;
