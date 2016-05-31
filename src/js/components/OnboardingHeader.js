var Container = require('react-container');
var React = require('react');

module.exports = React.createClass({
	getInitialState () {
		return {};
	},
	render () {
		return (
			<Container align="center" justify="center" direction="column" className="onboarding-header">
				<img src="./img/logo-mark.svg" className="onboarding-logo" />
				<div className="onboarding-heading onboarding-heading-1">React Europe 2016</div>
				<div className="onboarding-heading onboarding-heading-2">June 02 & 03 — Paris, France</div>
			</Container>
		);
	}
});
