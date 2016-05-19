var React = require('react');
var { Transitions } = require('../../../touchstone');

var OnboardingEnterCode = require('../../../components/Onboarding/enter-code');

module.exports = React.createClass({
	mixins: [Transitions],
	contextTypes: { dataStore: React.PropTypes.object.isRequired },

	onCodeEnter (ticketCode, callback) {
		dataStore.activateHackathon(ticketCode, function (err) {
			dataStore.synchronize();
			callback(err);
		});
	},

	render () {
		return (
			<OnboardingEnterCode
				onCodeEnter={this.onCodeEnter}
				nextScreen="app:main"
				id="hackathon"
				title="Hackathon"
			/>
		);
	}
});
