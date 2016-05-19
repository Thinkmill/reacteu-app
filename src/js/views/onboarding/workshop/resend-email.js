var OnboardingResendEmail = require('../../../components/Onboarding/resend-email');
var React = require('react');
var { Transitions } = require('../../../touchstone');

module.exports = React.createClass({
	mixins: [Transitions],
	render () {
		return (
			<OnboardingResendEmail
				id="workshop"
				nextScreen="app:onboarding-workshop"
				transition="show-from-right"
			/>
		);
	}
});
