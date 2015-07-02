var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
	displayName: 'Spinner',

	propTypes: {
		className: React.PropTypes.string,
		text: React.PropTypes.string
	},
	getDefaultProps () {
		return {
			text: 'Loading...'
		}
	},
	render () {
		var componentClassName = classNames({
			'view-feedback': true,
			'is-static': this.props.static
		}, this.props.className);

		return (
			<div className={componentClassName}>
				<div className="view-feedback-icon view-feedback-loading-icon" />
				<div className="view-feedback-text">{this.props.text}</div>
			</div>
		);

	}

});
