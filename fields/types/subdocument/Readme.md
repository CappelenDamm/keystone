# Nested Relationship Field

Stores a subdocument in the model, which belongs to another List in the system.

When the `many: true` option is set, it stores an Array `[]` instead.

Specify the related Model using the `ref` option. For a many-many relationship, set the `many` option to `true`.

## Example


```js

// var mongoose = require('mongoose');
// var keystone = require('keystone');

var keystone = require('./index');
var Types = keystone.Field.Types;


var Child = new keystone.List('Child', {
	label: "Child (subDocumentRelationship)",
	subDocument: true
});

Child.add({
  valueA: { type: String, required: true, default: "HELLO" },
  valueB: { type: String, readonly: true },
});

Child.register();

var Parent = new keystone.List('Parent', {
	label: "Parent (subDocumentRelationship)"
});
Parent.add({
	parentValueA: { type: String, required: true, default: "HELLO" },
	parentValueB: { type: String, readonly: true },
	child: {
		type: Types.SubDocumentRelationship,
		ref: "Child",
		refSchema: Child.schema
	},
	children: {
		type: Types.SubDocumentRelationship,
		ref: "Child",
		refSchema: Child.schema,
		many: true
	},
});
Parent.register();


async function test(){

}

var parent = new Parent.model();
var child = new Child.model({valueA: "X", valueB: "Y"});
parent.child = child;


var childA = new Child.model({valueA: "A", valueB: "A"});
var childB = new Child.model({valueA: "B", valueB: "B"});
parent.children = [childA, childB];

parent.validate();

parent.child.valueA = null;


parent.validate()
	.then(x => console.log("success", x))
	.catch(y => console.error("error", y))

```


## Methods

### `getExpandedData()`

Expands the stored value into an object containing `{ id, name }` properties.

The name is set by the `getDocumentName` method on the related List.

In `many` mode, an array of objects `[{ id, name }]` is returned.

The relationship path must be populated or this method will return unexpected results.

#### Example

```js
Post.model.findOne(id)
	.populate('author') // author is a relationship to the User list
	.exec((err, post) => {
		post._.author.getExpandedData() // { id: '1', name: 'Jed Watson' }
	});
```

### `format`

Returns the stored value as a `String`.

In `many` mode, the values in the array will be joined into a comma, space delimited list.

Will return unexpected results if the relationship path has been populated.

### `updateItem`

Updates with the provided value if it is different from the stored value.

`undefined` values are ignored.

When `null` is passed, mongoose will remove the path from the stored document and the value will be `undefined` when the item is next retrieved. This behaviour is different in `many` mode, when an empty array will be stored.

### `validateInput`

Ensures the value, if provided, is a string (or an array of strings in `many` mode).

Allows `null` to clear the field value.

### `validateRequiredInput`

Ensures a value has been provided. Empty strings are not valid.

## Filtering

Accepts a value (is an array of ObjectIDs), and can be inverted. Will match any items containing a relationship to _any_ of the provided ObjectIDs in the value array.

```
{
	inverted: Boolean,
	value: [ObjectID],
}
```

An empty `value` will match items containing `null` (single) or `[]` (many) stored in the field path.

Inverting the filter finds all items **not** matching the value.

Default filter arguments are:

```
{
	inverted: false,
	value: [],
}
```
