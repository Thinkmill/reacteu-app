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
				<div className="onboarding-heading onboarding-heading-1">React Europe 2015</div>
				<div className="onboarding-heading onboarding-heading-2">July 02 &amp; 03 &mdash; Paris, France</div>
			</Container>
		);
	}
});

