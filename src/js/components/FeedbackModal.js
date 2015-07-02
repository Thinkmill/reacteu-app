var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'FeedbackModal',

	propTypes: {
		className: React.PropTypes.string,
		visible: React.PropTypes.bool
	},

	getDefaultProps () {
		return {
			transition: 'none'
		};
	},

	renderBackdrop () {
		if (!this.props.visible) return null;
		return <div className="FeedbackModal-backdrop" />
	},

	renderDialog () {
		if (!this.props.visible) return null;

		// Set classnames
		var dialogClassName = classnames('FeedbackModal-dialog', this.props.className);

		return (
			<div className={dialogClassName}>
				{this.props.children}
			</div>
		);
	},

	render () {
		return (
			<div className="FeedbackModal">
				<ReactCSSTransitionGroup transitionName="FeedbackModal-dialog" component="div">
					{this.renderDialog()}
				</ReactCSSTransitionGroup>
				<ReactCSSTransitionGroup transitionName="FeedbackModal-backdrop" component="div">
					{this.renderBackdrop()}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
});
