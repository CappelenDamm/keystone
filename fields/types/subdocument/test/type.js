var demand = require('must');
var SubDocumentRelationshipType = require('../SubDocumentRelationshipType');

exports.initList = function (List) {
	// We can use relationships that refer to the same List to test
	List.add({
		single: { type: SubDocumentRelationshipType, ref: List.key, refSchema: List.schema },
		many: { type: SubDocumentRelationshipType, ref: List.key, refSchema: List.schema, many: true },
		value: { type: String, required: true, default: "initial"}
	});
};

const leanify = obj => JSON.parse(JSON.stringify(obj))

exports.testFieldType = function (List) {

	var childItem = new List.model();
	var childItemWithoutValue = new List.model();
	childItemWithoutValue.value = null;
	before(function (done) {
		done()
	});


	describe('single', function () {
		it('should invalidate id input', function (done) {
			List.fields.single.validateInput({ single: childItem.id }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate undefined input', function (done) {
			List.fields.single.validateInput({}, function (result) {
				try {
				demand(result).be.true();
				done();
				} catch (err) { done(err) }
			});
		});

		it('should validate empty input', function (done) {
			List.fields.single.validateInput({ single: '' }, function (result) {
				try {
				demand(result).be.true();
				done();
				} catch (err) { done(err) }
			});
		});

		it('should validate null input', function (done) {
			List.fields.single.validateInput({ single: null }, function (result) {
				try {
				demand(result).be.true();
				done();
				} catch (err) { done(err) }
			});
		});

		it('should invalidate boolean input', function (done) {
			List.fields.single.validateInput({ single: true }, function (result) {
				try {
				demand(result).be.false();
				done();
				} catch (err) { done(err) }
			});
		});

		it('should validate item object (proper sub document)', function (done) {
			List.fields.single.validateInput({ single: childItem }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		// it('should invalidate invalid item objects (invalid sub document)', function (done) {
		// 	List.fields.single.validateInput({ single: childItemWithoutValue }, function (result) {
		// 		try {
		// 			demand(result).be.false();
		// 			done();
		// 		} catch (err) { done(err) }
		// 	});
		// });

		it('should invalidate object input (not a sub document)', function (done) {
			List.fields.single.validateInput({ single: {} }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should invalidate array input', function (done) {
			List.fields.single.validateInput({ single: [] }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate required present input', function (done) {
			var testItem = new List.model();
			List.fields.single.validateRequiredInput(testItem, { single: childItem }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate required present input with item', function (done) {
			var testItem = new List.model();
			List.fields.single.validateRequiredInput(testItem, { single: childItem }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate required present input with existing value', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			List.fields.single.validateRequiredInput(testItem, { single: childItem }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should invalidate required id present input', function (done) {
			var testItem = new List.model();
			List.fields.single.validateRequiredInput(testItem, { single: childItem.id }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});


		it('should invalidate required id present input with existing value', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			List.fields.single.validateRequiredInput(testItem, { single: childItem.id }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should invalidate required not present input', function (done) {
			var testItem = new List.model();
			List.fields.single.validateRequiredInput(testItem, {}, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate required input with existing value', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			List.fields.single.validateRequiredInput(testItem, {}, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should invalidate required blank input with existing value', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			List.fields.single.validateRequiredInput(testItem, { single: '' }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should save the provided item', function (done) {
			var testItem = new List.model();
			List.fields.single.updateItem(testItem, { single: childItem }, function () {
				// TODO: We should be testing for errors here
				testItem.save(function (err, updatedItem) {
					List.model.findById(updatedItem.id, function (err, persistedData) {
						try {
							demand(leanify(persistedData.single)).eql(leanify(childItem));
							done();
						} catch (err) { done(err) }
					});
				});
			});
		});

		it('should not save the provided value with an item id', function (done) {
			var testItem = new List.model();
			List.fields.single.updateItem(testItem, { single: childItem.id }, function () {
				testItem.save().then(() => {
					demand("promise resolved").equal("promise rejected")
				}).catch(err => {
					demand("promise resolved").equal("promise rejected")
				}).finally(done);
			});
		});

		it('should clear the current value when provided null', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			testItem.save(function (err) {
				List.fields.single.updateItem(testItem, { single: null }, function () {
					// TODO: We should be testing for errors here
					testItem.save(function (err, updatedItem) {
						List.model.findById(updatedItem.id, function (err, persistedData) {
							try {
								demand(persistedData.single).be.null();
								done();
							} catch (err) { done(err) }
						});
					});
				});
			});
		});

		it('should clear the current value when provided ""', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			testItem.save(function (err) {
				List.fields.single.updateItem(testItem, { single: '' }, function () {
					// TODO: We should be testing for errors here
					testItem.save(function (err, updatedItem) {
						List.model.findById(updatedItem.id, function (err, persistedData) {
							try {
							demand(persistedData.single).be.null();
							done();
							} catch (err) { done(err) }
						});
					});
				});
			});
		});

		it('should not clear the current value when data object does not contain the field', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			testItem.save(function (err) {
				List.fields.single.updateItem(testItem, {}, function () {
					testItem.save(function (err, updatedItem) {
						List.model.findById(updatedItem.id, function (err, persistedData) {
							try {
							demand(leanify(persistedData.single)).eql(leanify(childItem));
							done();
							} catch (err) { done(err) }
						});
					});
				});
			});
		});

		it('should find based on id on sub document', function (done) {
			var testItem = new List.model({
				single: childItem,
			});
			testItem.save(function (err) {
				List.model.find({"single._id": childItem._id}, function (err, persistedData) {
					let relevant = persistedData.find(data => String(data.id) === String(testItem.id));
					try {
						demand(relevant).not.null();
						done();
					} catch (err) { done(err) }
				});
			});
		});
	});

	describe('many', function () {
		it('should invalidate id input', function (done) {
			List.fields.many.validateInput({ many: childItem.id }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate item input', function (done) {
			List.fields.many.validateInput({ many: childItem }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate empty array input', function (done) {
			List.fields.many.validateInput({ many: [] }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate null input', function (done) {
			List.fields.many.validateInput({ many: null }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should invalidate array input with ids', function (done) {
			List.fields.many.validateInput({ many: [childItem.id] }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});
		it('should validate array input with items', function (done) {
			List.fields.many.validateInput({ many: [childItem] }, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		// it('should invalidate arrays with invalid item', function (done) {
		// 	List.fields.many.validateInput({ many: [childItem, childItemWithoutValue] }, function (result) {
		// 		try {
		// 		demand(result).be.false();
		// 		done();
		// 		} catch (err) { done(err) }
		// 	});
		// });

		it('should invalidate arrays with non-item', function (done) {
			List.fields.many.validateInput({ many: [childItem, {}] }, function (result) {
				try {
					demand(result).be.false();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should validate undefined input', function (done) {
			List.fields.many.validateInput({}, function (result) {
				try {
					demand(result).be.true();
					done();
				} catch (err) { done(err) }
			});
		});

		it('should not clear the current values when data object does not contain the field', function (done) {
			var testItem = new List.model({
				many: [childItem, childItem],
			});
			testItem.save(function (err) {
				List.fields.many.updateItem(testItem, {}, function () {
					testItem.save(function (err, updatedItem) {
						List.model.findById(updatedItem.id, function (err, persistedData) {
							try {
								demand(persistedData.many.length).equal(2);
								demand(String(persistedData.many[0].id)).equal(String(childItem.id));
								demand(leanify(persistedData.many[0])).eql(leanify(childItem));
								demand(String(persistedData.many[1].id)).equal(String(childItem.id));
								done();
							} catch (err) { done(err) }
						});
					});
				});
			});
		});

		it('should update the current values with the new values from the data object', function (done) {
			var testItem = new List.model({
				many: [childItem, childItem, childItem],
			});
			testItem.save(function (err) {
				List.fields.many.updateItem(testItem, { many: [childItem, childItem] }, function () {
					testItem.save(function (err, updatedItem) {
						List.model.findById(updatedItem.id, function (err, persistedData) {
							try {
								demand(leanify(persistedData.many)).to.eql(leanify([childItem, childItem]));
								done();
							} catch (err) { done(err) }
						});
					});
				});
			});
		});


		it('should find based on id', function (done) {
			var testItem = new List.model({
				many: [childItem, childItem, childItem],
			});
			testItem.save(function (err) {
				List.model.find({"many.$._id": childItem.id}, function (err, persistedData) {
					let relevant = persistedData.find(data => String(data.id) === String(updatedItem.id));
					try {
						demand(relevant).not.null();
						done();
					} catch (err) { done(err) }
				});
			});
		});
	});

	describe('addFilterToQuery', function () {
		it('should filter arrays', function () {
			var result = List.fields.single.addFilterToQuery({
				value: ['Some', 'strings'],
			});
			demand(result[`single._id`]).eql({
				$in: ['Some', 'strings'],
			});
		});

		it('should convert a single string to an array and filter that', function () {
			var result = List.fields.single.addFilterToQuery({
				value: 'a string',
			});
			demand(result[`single._id`]).eql({
				$in: ['a string'],
			});
		});

		it('should support inverted filtering with an array', function () {
			var result = List.fields.single.addFilterToQuery({
				value: ['Some', 'strings'],
				inverted: true,
			});
			demand(result[`single._id`]).eql({
				$nin: ['Some', 'strings'],
			});
		});

		it('should filter by existence if no value is specified', function () {
			var result = List.fields.single.addFilterToQuery({});
			demand(result.single).be.null();
		});

		it('should filter by non-existance if no value is specified', function () {
			var result = List.fields.single.addFilterToQuery({
				inverted: true,
			});
			demand(result.single).eql({
				$ne: null,
			});
		});

		it('should filter by emptiness if many is true and no value is specified', function () {
			var result = List.fields.many.addFilterToQuery({});
			demand(result.many).eql({
				$size: 0,
			});
		});

		it('should filter by non-emptiness if many is true and no value is specified', function () {
			var result = List.fields.many.addFilterToQuery({
				inverted: true,
			});
			demand(result.many).eql({
				$not: {
					$size: 0,
				},
			});
		});
	});
};
