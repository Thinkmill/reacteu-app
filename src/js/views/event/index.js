var animation = require('../../touchstone/animation');
var Container = require('react-container');
var Sentry = require('react-sentry');
var React = require('react');
var Tappable = require('react-tappable');
var Social = require('../../mixins/social');

var PeopleList = require('../../components/PeopleList');
var Sponsor = require('./sponsor');
var capitalize = require('capitalize');

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

var TIER_PRIORITIES = {
	'diamond': 0,
	'platinum': 1,
	'gold': 2,
	'silver': 3,
	'bronze': 4,
	'startup': 5,
	'supporter': 6
};

const scrollable = Container.initScrollable();

module.exports = React.createClass({
	displayName: 'ViewEvent',
	mixins: [Sentry(), Social, animation.Mixins.ScrollContainerToTop],
	contextTypes: {
		dataStore: React.PropTypes.object.isRequired
	},

	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				leftIcon: 'ion-android-menu',
				leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
				title: 'Event'
			};
		}
	},

	getInitialState () {
		return {
			searchString: '',
			organisers: this.context.dataStore.getOrganisers(),
			sponsors: this.context.dataStore.getSponsors()
		};
	},

	componentDidMount () {
		var body = document.getElementsByTagName('body')[0];
		var menuWrapper = document.getElementsByClassName('Tabs-Navigator-wrapper')[0];
		body.classList.remove('android-menu-is-open');
		menuWrapper.addEventListener('click', function(e) {
			body.classList.remove('android-menu-is-open');
		});
		
		this.watch(emitter, 'navigationBarLeftAction', function () {
			body.classList.toggle('android-menu-is-open');
		});
		this.watch(this.context.dataStore, 'update-people', this.updateEventState);
		this.watch(this.context.dataStore, 'update-sponsors', this.updateEventState);
	},

	updateEventState () {
		this.setState({
			organisers: this.context.dataStore.getOrganisers(),
			sponsors: this.context.dataStore.getSponsors()
		});
	},

	openAddress () {
		window.open('http://maps.apple.com/?daddr=327+Rue+de+Charenton,+75012+Paris,+France', '_blank', 'toolbar=yes,location=no,transitionstyle=coververtical')
	},

	render () {
		var organisers = this.state.organisers;
		var sponsorData = this.state.sponsors;
		var sponsors = [];

		function orderByPriority (sponsor1, sponsor2) {
			return TIER_PRIORITIES[sponsor1.tier] - TIER_PRIORITIES[sponsor2.tier];
		}

		var lastTier;
		sponsorData.sort(orderByPriority).forEach(function (sponsor, i) {
			var tierName = capitalize(sponsor.tier);
			var tierPriority = TIER_PRIORITIES[sponsor.tier];
			var lite = tierPriority > 3;

			if (tierName !== lastTier) {
				var tierLabel = tierName === 'Supporter' ? 'Supporters' : tierName;
				sponsors.push(
					<div key={'tierHeading' + i} className="EventInfo__sponsors__tier">
						<span className="EventInfo__sponsors__tier-text">{tierName}</span>
					</div>
				);
				lastTier = tierName;
			}

			sponsors.push(<Sponsor key={'sponsor' + i} { ... sponsor} lite={lite} />)
		});

		// Social
		var dataStore = this.context.dataStore;
		var eventTwitter = dataStore.getSettings().eventTwitter;
		var eventFacebook = dataStore.getSettings().eventFacebookPageId;

		return (
			<Container fill scrollable={scrollable} ref="scrollContainer" className="EventInfo">
				<div className="EventInfo__hero">
					<div className="EventInfo__hero-inner">
						<div className="EventInfo__hero_title">Espace Charenton</div>
						<div className="EventInfo__hero_address">327, rue de Charenton 75012 Paris</div>
						<Tappable onTap={this.openAddress} className="EventInfo__hero_button button">Get Directions</Tappable>
						<div className="EventInfo__hero_date">July 02 &amp; 03 &mdash; Paris, France</div>
					</div>
				</div>
				<div className="EventInfo__summary text-block">ReactEurope is the occasion to meet the core team and other awesome members of the community to learn, socialize and have fun in the beautiful city of Paris with great food, entertainment, connectivity, prizes and more!</div>
				<div className="button-table">
					<Tappable onTap={this.openTwitter.bind(this, eventTwitter)} className="button-table__item EventInfo__link">
						<span className="button-table__item__icon EventInfo__link__icon--twitter ion-social-twitter" />
						<div className="button-table__item__label">@ReactEurope</div>
					</Tappable>
					<Tappable onTap={this.openFacebook.bind(this, eventFacebook)} className="button-table__item EventInfo__link">
						<span className="button-table__item__icon EventInfo__link__icon--facebook ion-social-facebook" />
						<div className="button-table__item__label">ReactEurope</div>
					</Tappable>
				</div>
				<PeopleList people={organisers} heading="Organisers" previousView="event" className="EventInfo__organisers" />
				<div className="EventInfo__sponsors">
					<div className="EventInfo__sponsors__heading">Sponsors</div>
					{sponsors}
				</div>
			</Container>
		);
	}
});

