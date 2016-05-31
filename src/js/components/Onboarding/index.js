var Container = require('react-container');
var Sentry = require('react-sentry');
var OnboardingHeader = require('../OnboardingHeader');
var React = require('react/addons');
var Scanner = require('../Scanner');
var Tappable = require('react-tappable');
var Transition = React.addons.CSSTransitionGroup;
var { Link, Transitions } = require('../../touchstone');

var classnames = require('classnames');
var icons = require('../../icons');

var OnboardingView = React.createClass({
	mixins: [Sentry(), Transitions],
	contextTypes: { dataStore: React.PropTypes.object.isRequired },
  propTypes: {
    title: React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    nextScreen: React.PropTypes.string.isRequired,
    onCodeEnter: React.PropTypes.func.isRequired,
  },

	getInitialState () {
		var showResendEmail = this.context.dataStore.getSettings().showResendEmail;
		return {
			online: window.navigator.onLine,
			scanning: false,
			showResendEmail: showResendEmail,
			valid: false
		};
	},

	componentDidMount () {
		this.watch(window, 'online', this.updateOnlineStatus);
		this.watch(window, 'offline', this.updateOnlineStatus);
		document.addEventListener('online', this.onOnline, false);
		document.addEventListener('offline', this.onOffline, false);
	},

	onOnline () {
		this.setState({
			online: true,
		});
	},

	onOffline () {
		this.setState({
			online: false,
		});
	},

	updateOnlineStatus (event) {
		this.setState({
			online: window.navigator.onLine
		});
	},

	enableScanner () {
		if (!window.cordova) return window.alert('Sorry, this is only available on mobile devices');
		this.setState({ scanning: true });
	},

	handleScanner (err, ticketCode) {
		var dataStore = this.context.dataStore;
		var self = this;

		this.setState({ scanning: false });

		if (!ticketCode || err) {
			return console.error('Scanner Failed:', err);
		}

		// success
		this.setState({
			loading: true
		}, function () {
      self.props.onCodeEnter(ticketCode, (err) => {
        self.setState({
					loading: false,
					valid: !err
				}, function () {
					// success: show the success icon for 1 second then fade to the app
					if (self.state.valid === true) {
						setTimeout(function () {
							self.transitionTo(self.props.nextScreen, {
								transition: 'fade'
							});
						}, 1000);

					// fail: return validity to neutral
					} else {
						setTimeout(function () {
							self.setState({ valid: null });
						}, 2000);
					}
				});
      });
    });
	},

	renderIcon (icon) {
		var iconClassname = classnames('onboarding-scan__icon', {
			'ion-load-b': this.state.scanning,
			'is-loading': this.state.scanning || this.state.loading,
			'ion-ios-checkmark': this.state.valid,
			'is-valid': this.state.valid
		});
		var element = (this.state.scanning || this.state.valid) ? (
			<span className={iconClassname} />
		) : (
			<span dangerouslySetInnerHTML={{__html: icon}} className="onboarding-scan__image" />
		);

		return element;
	},

	renderScanButton () {
		var content = this.state.online ? (
			<div key="online" className="onboarding-scan">
				<Tappable loading={this.state.scanning} onTap={this.enableScanner} className="onboarding-scan__button">
					{this.renderIcon(icons.qr)}
				</Tappable>
				<div className="onboarding-scan__text">Scan the QR code in your email</div>
			</div>
		) : (
			<div key="offline" className="onboarding-scan">
				<div className="onboarding-scan__button">
					<div className="onboarding-scan__icon ion-wifi" />
				</div>
				<div className="onboarding-scan__text">Please find a data connection to register</div>
			</div>
		);

		return (
			<Transition transitionName="animation-fade" className="onboarding-scan-wrapper">
				{content}
			</Transition>
		);
	},

	renderEnterCode () {
		return this.state.online ? <Link to={"app:onboarding-" + this.props.id + "-enter-code"} transition="fade" className="onboarding-footer__button onboarding-footer__button--primary">Enter Code</Link> : null;
	},

	renderResendEmail () {
		return (this.state.online && this.state.showResendEmail) ? <Link to={"app:onboarding-" + this.props.id + "-resend-email"} transition="fade" className="onboarding-footer__button">Resend Code</Link> : null;
	},

	renderScanner () {
		return this.state.scanning ? <Scanner action={this.handleScanner} /> : null;
	},

	render () {
		return (
			<Container direction="column" className="onboarding-container">
				<OnboardingHeader />
				<h2 className="onboarding-heading-1">{this.props.title}</h2>
				<Container justify align="center" direction="column" className="onboarding-body">
					{this.renderScanButton()}
				</Container>
				<Container justify align="center" direction="row" className="onboarding-footer">
					{this.renderResendEmail()}
					<Link to={this.props.nextScreen} transition={this.props.transition || "fade"} className="onboarding-footer__button">Skip</Link>
					{this.renderEnterCode()}
				</Container>
				{this.renderScanner()}
			</Container>
		);
	}
});

export default OnboardingView;
