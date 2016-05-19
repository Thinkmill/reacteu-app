var Sentry = require('react-sentry');
var React = require('react/addons');

var { Transitions } = require('../../../touchstone');

var OnboardingView = require('../../../components/Onboarding');

var MainEventOnboarding = React.createClass({
	mixins: [Sentry(), Transitions],
	contextTypes: { dataStore: React.PropTypes.object.isRequired },

	onCodeEnter (ticketCode, callback) {
		dataStore.activate(ticketCode, function (err) {
			dataStore.synchronize();
			callback(err);
		});
	},

	render () {
		return (
			<OnboardingView
				onCodeEnter={this.onCodeEnter}
				nextScreen="app:onboarding-workshop"
				id="main-event"
				title="Main Event"
				transition="show-from-right"
			/>
		);
	}
});

export default MainEventOnboarding;