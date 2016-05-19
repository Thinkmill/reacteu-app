var React = require('react');
var { Transitions } = require('../../../touchstone');

var OnboardingEnterCode = require('../../../components/Onboarding/enter-code');

module.exports = React.createClass({
	mixins: [Transitions],
	contextTypes: { dataStore: React.PropTypes.object.isRequired },

	onCodeEnter (ticketCode, callback) {
		dataStore.activateWorkshop(ticketCode, function (err) {
			dataStore.synchronize();
			callback(err);
		});
	},

	render () {
		return (
			<OnboardingEnterCode
				onCodeEnter={this.onCodeEnter}
				nextScreen="app:onboarding-hackathon"
				id="workshop"
				title="Workshop"
				transition="show-from-right"
			/>
		);
	}
});
