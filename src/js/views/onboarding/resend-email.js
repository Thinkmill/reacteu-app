var Container = require('react-container');
var OnboardingHeader = require('../../components/OnboardingHeader');
var React = require('react');
var { Link, Transitions } = require('../../touchstone');

var classnames = require('classnames');

module.exports = React.createClass({
	mixins: [Transitions],
	contextTypes: { dataStore: React.PropTypes.object.isRequired },

	getInitialState () {
		return {
			feedback: false,
			input: '',
			loading: false,
			online: window.navigator.onLine
		};
	},

	componentDidMount () {
		var input = this.refs.input.getDOMNode();

		// wait until the view transition ends then focus the field
		setTimeout(function () {
			input.focus();
		}, 320);
	},

	handleFormInput (e) {
		this.setState({
			input: e.target.value
		});
	},

	handleFormSubmission (e) {
		e.preventDefault();
		var self = this;
		var dataStore = this.context.dataStore

		this.setState({
			loading: true
		}, function () {
			dataStore.resend(this.state.input, function (err) {
				self.setState({
					loading: false,
					valid: !err
				}, function () {
					// success: show the success icon for 1 second then fade to the app
					if (self.state.valid) {
						setTimeout(function () {
							return self.transitionTo('app:onboarding', { transition: 'fade' });
						}, 1000);

					// fail: return validity to neutral
					} else {
						setTimeout(function () {
							return self.setState({ valid: null });
						}, 2000);
					}
				})
			})
		});
	},

	render () {
		var submitButtonClass = classnames('onboarding-form__button', {
			'is-loading': this.state.loading,
			'is-valid': this.state.valid === true,
			'is-invalid': this.state.valid === false
		});

		return (
			<Container direction="column">
				<OnboardingHeader />
				<Container justify align="center" direction="column">
					<form onSubmit={this.handleFormSubmission} className="onboarding-form" noValidate>
						<div className="onboarding-form__section onboarding-form__section--field">
							<input type="email" ref="input" onChange={this.handleFormInput} value={this.state.input} placeholder="Enter Email" className="onboarding-form__input" disabled={this.state.feedback === 'sent'} />
						</div>
						<div className="onboarding-form__section onboarding-form__section--button">
							<button type="submit" className={submitButtonClass} />
						</div>
					</form>
				</Container>
				<Container justify align="center" direction="row" className="onboarding-footer">
					<Link to="app:onboarding" transition="fade" className="onboarding-footer__button">Back</Link>
					<Link to="app:main" transition="fade" className="onboarding-footer__button">Skip</Link>
					<Link to="app:onboarding-enter-code" transition="fade" className="onboarding-footer__button">Enter Code</Link>
				</Container>
			</Container>
		);
	}
});
