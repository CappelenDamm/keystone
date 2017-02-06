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
	renderField () {
		let vimeoFile = this.props.values.vimeoFile;
		if (vimeoFile) {
			let html = vimeoFile.embed;
			return <div contentEditable='true' dangerouslySetInnerHTML={{ __html: html }}></div>;
    }
		return null;
	},
	renderValue () {
		return null;
	},
});
