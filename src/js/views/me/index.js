var Container = require('react-container');
var Sentry = require('react-sentry');
var React = require('react');
var { animation, Link, Transitions } = require('../../touchstone');
var Social = require('../../mixins/social')
var Section = require('./section');

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
		var ticketCode = this.context.dataStore.getTicketCode()
		var hackathonTicketCode = this.context.dataStore.getHackathonTicketCode();
		var workshopTicketCode = this.context.dataStore.getWorkshopTicketCode();
		var qrUrl = 'https://chart.googleapis.com/chart?cht=qr&chl=' + ticketCode + '&chs=400x400';

		return (
			<Container scrollable ref="scrollContainer" align="center" direction="column" className="MeRegistration__body">

					{/* Main event*/}
					{(person && person.first_name) ? (
						<Container align="center" className="MeRegistration__section">
							<div className="PersonDetails">
								{(person.picture || person.avatar_url || person.pic_url) ? (
									<img src={person.picture || person.avatar_url || person.pic_url} className="PersonDetails__avatar" />
								) : null}
								{person.first_name && <div className="PersonDetails__heading">{person.first_name} {person.last_name}</div>}
								{person.bio && <div className="PersonDetails__text text-block">{person.bio}</div>}
								{(person.twitter || person.github) && <div className="PersonDetails__profiles">
									{twitter}
									{github}
								</div>}
							</div>
							<Container align="center" className="entry-code">
								<div className="entry-code__heading">Please show this to gain entry:</div>
								<img src={qrUrl} className="entry-code__image" />
								<div className="entry-code__text">{ticketCode.toUpperCase()}</div>
							</Container>
						</Container>
					) : (
						<Container align="center" className="MeRegistration__section">
							<div className="MeRegistration__heading">ReactEurope 2016</div>
							<p className="MeRegistration__intro">Register to get the most out of ReactEurope&nbsp;2016!</p>
							<Link to="app:onboarding-main-event" transition="fade" className="MeRegistration__footer-button">Register</Link>
						</Container>
					)}
					<Section
						title="Workshop"
						ticketCode={workshopTicketCode}
						registerLink="app:onboarding-workshop"
					/>
					<Section
						title="Hackathon"
						ticketCode={hackathonTicketCode}
						registerLink="app:onboarding-hackathon"
					/>
				</Container>
		);
	}
});

// OLD CODE
/* <div className="MeRegistration__benefits">
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
</div> */
