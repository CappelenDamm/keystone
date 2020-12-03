var async = require('async');
var demand = require('must');
var SubDocumentRelationshipType = require('../SubDocumentRelationshipType');

exports.initList = function (List) {
	List.add({
		name: {type: String},
		singleSubDocument: { type: SubDocumentRelationshipType, ref: List.key, refSchema: List.schema },
	});
};

var items;
const leanify = obj => JSON.parse(JSON.stringify(obj))

exports.getTestItems = function (List, callback) {
	items = {
		jed: new List.model({ name: 'Jed' }),
		max: new List.model({ name: 'Max' }),
	}
	callback(null, [
		{ singleSubDocument: null },
		{ singleSubDocument: items.jed },
		{ singleSubDocument: items.max },
	]);
};

exports.testFilters = function (List, filter) {

	describe('match', function () {

		it('should find exact matches', function (done) {
			
			filter({
				"singleSubDocument": {
					value: items.jed._id,
				},
			}, "singleSubDocument", false, function (results) {
				try{
					demand(leanify(results)).eql(leanify([items.jed]));
					done();
				} catch(err) {
					done(err);
				}
			});
		});

		it('should find exact matches 2', function (done) {
			
			filter({
				"singleSubDocument": {
					value: items.jed,
				},
			}, "singleSubDocument", false, function (results) {
				try{
					demand(leanify(results)).eql(leanify([items.jed]));
					done();
				} catch(err) {
					done(err);
				}
			});
		});

		it('should invert exact matches', function (done) {
			filter({
				"singleSubDocument": {
					inverted: true,
					value: items.jed._id,
				},
			}, "singleSubDocument", false, function (results) {
				try{
					demand(leanify(results)).eql(leanify([undefined,  items.max]));
					done();
				} catch(err) {
					done(err);
				}
			});
		});

		it.skip('should find multiple matches', function (done) {
			filter({
				"singleSubDocument": {
					value: [items.jed._id, items.max._id],
				},
			}, "singleSubDocument", false, function (results) {
				try{
					demand(leanify(results)).eql(leanify([items.jed, items.max]));
					done();
				} catch(err) {
					done(err);
				}
			});
		});

		it('should find empty relationships', function (done) {
			filter({
				"singleSubDocument": {
					value: '',
				},
			}, "singleSubDocument", false, function (results) {
				try{
					demand(leanify(results)).eql(leanify([undefined]));
					done();
				} catch(err) {
					done(err);
				}
			});
		});

	});

};
