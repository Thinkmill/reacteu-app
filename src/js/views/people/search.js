var React = require('react');
var Tappable = require('react-tappable');

module.exports = React.createClass({
	displayName: 'PeopleSearch',
	propTypes: {
		searchString: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},

	handleChange (event) {
		this.props.onChange(event.target.value);
	},

	reset () {
		this.props.onChange('');
		// JW - this shouldn't focus the search field
		// this.refs.input.getDOMNode().focus();
	},

	render () {
		var clearIcon;

		if (this.props.searchString.length > 0) {
			clearIcon = <Tappable onTap={this.reset} className="Headerbar-form-clear ion-close-circled" />;
		}

		return (
			<div className="Headerbar-form-field Headerbar-form-icon ion-ios-search-strong">
				<input ref="input" value={this.props.searchString} onChange={this.handleChange} className="Headerbar-form-input" placeholder='Search...' autoCapitalize="off" />
				{clearIcon}
			</div>
		);
	}
});
