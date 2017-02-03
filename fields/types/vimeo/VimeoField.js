import Field from '../Field';
import React, { PropTypes } from 'react';
import { FormInput } from '../../../admin/client/App/elemental';

/*
	TODO:
	- gravatar
	- validate email address
 */

module.exports = Field.create({
	displayName: 'VimeoField',
	propTypes: {
		path: PropTypes.string.isRequired,
		value: PropTypes.string,
	},
	statics: {
		type: 'Vimeo',
	},
  upload() {

	},
	renderField () {
		console.log('adaadw');
		return (
			<div><input type="button" value="upload" onClick={this.upload.bind(this)}/>
			<FormInput
				name={this.getInputName(this.props.path)}
				ref="focusTarget"
				value={this.props.value}
				onChange={this.valueChanged}
				autoComplete="off"
				type="email"
			/>
		</div>
		);
	},
	renderValue () {
		console.log('HELOASRJ32');
		return this.props.value ? (
			<FormInput noedit component="a" href={'mailto:' + this.props.value}>
				{this.props.value}
				HELLO WORLD
			</FormInput>
		) : (
			<FormInput noedit />
		);
	},
});
