var OnboardingResendEmail = require('../../../components/Onboarding/resend-email');
var React = require('react');
var { Transitions } = require('../../../touchstone');

module.exports = React.createClass({
	mixins: [Transitions],
	render () {
		return (
			<OnboardingResendEmail
				id="main-event"
				nextScreen="app:onboarding-main-event"
				transition="fade"
			/>
		);
	}
});
