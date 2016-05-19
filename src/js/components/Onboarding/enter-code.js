var Container = require('react-container');
var OnboardingHeader = require('../../components/OnboardingHeader');
var React = require('react');
var { Link, Transitions } = require('../../touchstone');

var classnames = require('classnames');

module.exports = React.createClass({
	mixins: [Transitions],
	contextTypes: { dataStore: React.PropTypes.object.isRequired },
  propTypes: {
		title: React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    nextScreen: React.PropTypes.string.isRequired,
		onCodeEnter: React.PropTypes.func.isRequired
  },

	getInitialState () {
		var showResendEmail = this.context.dataStore.getSettings().showResendEmail;
		return {
			input: '',
			loading: false,
			showResendEmail: showResendEmail,
			valid: null
		};
	},

	componentDidMount () {
		var input = this.refs.input.getDOMNode();

		// wait until the view transition ends then focus the field
		setTimeout(function () {
			input.click();
		}, 320);
	},

	handleFormInput (e) {
		this.setState({
			input: e.target.value.toUpperCase()
		});
	},

	renderResendEmail () {
		return (this.state.showResendEmail) ? (
			<Link to={"app:onboarding-" + this.props.id + "-resend-email"} transition="fade" className="onboarding-footer__button">Resend Code</Link>
		) : null;
	},

	handleFormSubmission (e) {

		// prevent the form from actually submitting
		e.preventDefault();

		if (!this.state.input) {
			return;
		}

		var ticketCode = this.state.input.toLowerCase();
		var self = this;

		this.setState({
			loading: true
		}, function () {
			this.props.onCodeEnter(ticketCode, function (err) {
				self.setState({
					loading: false,
					valid: !err
				}, function () {
					// success: show the success icon for 1 second then fade to the app
					if (self.state.valid === true) {
						setTimeout(function () {
							return self.transitionTo(self.props.nextScreen, {
								transition: 'fade'
							});
						}, 1000);

					// fail: return validity to neutral
					} else {
						setTimeout(function () {
							return self.setState({ valid: null });
						}, 2000);
					}
				});
			});
		});
	},

	render () {
		var submitButtonClass = classnames('onboarding-form__button', {
			'is-loading': this.state.loading,
			'is-valid': this.state.valid,
			'is-invalid': this.state.valid === false
		});

		var submitIsDisabled = this.state.loading || this.state.valid || this.state.valid === false;

		return (
			<Container direction="column" className="onboarding-container">
				<OnboardingHeader />
				<h2 className="onboarding-heading-1">{this.props.title}</h2>
				<Container justify align="center" direction="column">
					<form onSubmit={this.handleFormSubmission} action="#" className="onboarding-form" noValidate>
						<div className="onboarding-form__section onboarding-form__section--field">
							<input type="text" ref="input" onChange={this.handleFormInput} value={this.state.input} placeholder="Enter Code" className="onboarding-form__input" disabled={this.state.feedback === 'sent'} />
						</div>
						<div className="onboarding-form__section onboarding-form__section--button">
							<button type="submit" className={submitButtonClass} disabled={submitIsDisabled} />
						</div>
					</form>
				</Container>
				<Container justify align="center" direction="row" className="onboarding-footer">
					{this.renderResendEmail()}
					<Link to={this.props.nextScreen} transition="fade" className="onboarding-footer__button">Skip</Link>
					<Link to={"app:onboarding-" + this.props.id} transition="fade" className="onboarding-footer__button onboarding-footer__button--primary">Back</Link>
				</Container>
			</Container>
		);
	}
});
