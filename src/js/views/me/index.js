var Container = require('react-container');
var Sentry = require('react-sentry');
var React = require('react');
var { animation, Link, Transitions } = require('../../touchstone');
var Social = require('../../mixins/social')

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

module.exports = React.createClass({
	displayName: 'ViewMe',
	contextTypes: { dataStore: React.PropTypes.object.isRequired },
	mixins: [Sentry(), Transitions, Social, animation.Mixins.ScrollContainerToTop],

	statics: {
		navigationBar: 'main',
		getNavigation (props) {
			var name = props.me && props.me.name

			return {
				leftIcon: 'ion-android-menu',
				leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
				rightAction: emitter.emit.bind(emitter, 'navigationBarRightAction'),
				rightButtonDisabled: !name,
				rightLabel: name ? 'Edit' : '',
				title: 'Me'
			}
		}
	},

	getDefaultProps () {
		return {
			me: {}
		}
	},

	componentDidMount () {
		var self = this;
		var body = document.getElementsByTagName('body')[0];
		var menuWrapper = document.getElementsByClassName('Tabs-Navigator-wrapper')[0];
		body.classList.remove('android-menu-is-open');
		menuWrapper.addEventListener('click', function (e) {
			body.classList.remove('android-menu-is-open');
		});

		// navbar actions
		this.watch(emitter, 'navigationBarLeftAction', function () {
			body.classList.toggle('android-menu-is-open');
		});
		this.watch(emitter, 'navigationBarRightAction', function () {
			self.transitionTo('tabs:me-edit', { transition: 'fade' })
		});
	},

	render () {
		var person = this.props.me
		var github = person.github && this.renderGithub(person.github)
		var twitter = person.twitter && this.renderTwitter(person.twitter)
		var publicIndicator = person.isPublic ? <div className="PersonDetails__public-indicator">Profile is Public</div> : <div className="PersonDetails__public-indicator">Profile is Private</div>;
		var ticketCode = this.context.dataStore.getTicketCode()
		var fillMessage = (!person.bio && !github && !twitter) ? <div style={{ lineHeight: '1.4', marginTop: '1em', fontSize: '0.85em' }}>Tap edit to complete your profile and connect with other attendees</div> : null;
		var qrUrl = 'https://chart.googleapis.com/chart?cht=qr&chl=' + ticketCode + '&chs=400x400'

		var content = (person && person.name) ? (
			<Container scrollable ref="scrollContainer">
				<div className="PersonDetails">
					<img src={person.picture} className="PersonDetails__avatar" />
					{person.name && <div className="PersonDetails__heading">{person.name}</div>}
					{publicIndicator}
					{fillMessage}
					{person.bio && <div className="PersonDetails__text text-block">{person.bio}</div>}
					{(person.twitter || person.github) && <div className="PersonDetails__profiles">
						{twitter}
						{github}
					</div>}
				</div>
				<Container align="center" justify="center" className="entry-code">
					<div className="entry-code__heading">Please show this to gain entry:</div>
					<img src={qrUrl} className="entry-code__image" />
					<div className="entry-code__text">{ticketCode.toUpperCase()}</div>
				</Container>
			</Container>
		) : (
			<Container direction="column">
				<Container fill align="center" justify="center" direction="column" scrollable className="MeRegistration__body">
					<div className="MeRegistration__heading">ReactEurope 2015</div>
					<p className="MeRegistration__intro">Register to get the most out of ReactEurope&nbsp;2015!</p>
					<div className="MeRegistration__benefits">
						<div className="MeRegistration__benefit">
							<div className="MeRegistration__benefit__icon ion-qr-scanner" />
							<div className="MeRegistration__benefit__label">Enter the conference simply by having your QR code scanned</div>
						</div>
						<div className="MeRegistration__benefit">
							<div className="MeRegistration__benefit__icon ion-person" />
							<div className="MeRegistration__benefit__label">Make your profile public and view the full list of public attendees</div>
						</div>
						<div className="MeRegistration__benefit">
							<div className="MeRegistration__benefit__icon ion-speakerphone" />
							<div className="MeRegistration__benefit__label">Leave feedback for the speakers on your favourite talks</div>
						</div>
					</div>
				</Container>
				<Container align="center" justify="center" className="MeRegistration__footer">
					<Link to="app:onboarding" transition="fade" className="MeRegistration__footer-button">Register</Link>
				</Container>
			</Container>
		);

		return content;
	}
});

