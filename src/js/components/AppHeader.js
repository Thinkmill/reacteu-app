var React = require('react');
var Touchstone = require('../touchstone');

var { NavigationBar } = Touchstone;

module.exports = React.createClass({
	displayName: 'AppHeader',
	propTypes: {
		leftAction: React.PropTypes.func,
		leftArrow: React.PropTypes.bool,
		leftButtonDisabled: React.PropTypes.bool,
		leftIcon: React.PropTypes.string,
		leftLabel: React.PropTypes.string,
		rightAction: React.PropTypes.func,
		rightArrow: React.PropTypes.bool,
		rightButtonDisabled: React.PropTypes.bool,
		rightIcon: React.PropTypes.string,
		rightLabel: React.PropTypes.string,
		title: React.PropTypes.string
	},
	getInitialState () {
		return {
			navbarProps: this.getDefaultNavbarProps()
		};
	},
	getDefaultNavbarProps () {
		return {
			direction: 0,
			leftAction: null,
			leftArrow: false,
			leftButtonDisabled: false,
			leftIcon: '',
			leftLabel: '',
			rightAction: null,
			rightArrow: false,
			rightButtonDisabled: false,
			rightIcon: '',
			rightLabel: '',
			title: ''
		};
	},
	update (navbarProps) {
		this.setState({ navbarProps: navbarProps });
	},
	render () {
		return <NavigationBar {...this.state.navbarProps} />;
	}
});