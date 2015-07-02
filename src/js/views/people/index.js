var animation = require('../../touchstone/animation');
var Container = require('react-container');
var Sentry = require('react-sentry');
var React = require('react');

var PeopleList = require('../../components/PeopleList');
var Search = require('./search');

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

const scrollable = Container.initScrollable();

var lastFilterStarred = false;
var lastFilterSearch = '';

function getNavigation (props, onlyStarred) {
	if (onlyStarred === undefined) {
		onlyStarred = lastFilterStarred;
	}

	return {
		leftIcon: 'ion-android-menu',
		leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
		rightLabel: onlyStarred ? 'All' : 'Starred',
		rightAction: emitter.emit.bind(emitter, 'navigationBarRightAction'),
		title: 'People'
	};
}

module.exports = React.createClass({
	displayName: 'ViewPeople',
	contextTypes: {
		app: React.PropTypes.object,
		dataStore: React.PropTypes.object.isRequired
	},
	mixins: [Sentry(), animation.Mixins.ScrollContainerToTop],

	statics: {
		navigationBar: 'main',
		getNavigation: getNavigation
	},

	getInitialState () {
		return {
			attendees: this.context.dataStore.getAttendees(),
			organisers: this.context.dataStore.getOrganisers(),
			speakers: this.context.dataStore.getSpeakers(),
			searchString: lastFilterSearch,
			onlyStarred: lastFilterStarred
		};
	},

	componentDidMount () {
		var body = document.getElementsByTagName('body')[0];
		var menuWrapper = document.getElementsByClassName('Tabs-Navigator-wrapper')[0];
		body.classList.remove('android-menu-is-open');
		menuWrapper.addEventListener('click', function(e) {
			body.classList.remove('android-menu-is-open');
		});

		// navbar actions
		this.watch(emitter, 'navigationBarLeftAction', function () {
			body.classList.toggle('android-menu-is-open');
		});
		this.watch(emitter, 'navigationBarRightAction', this.toggleStarred);
		this.watch(this.context.dataStore, 'update-people', this.updatePeopleState);
	},

	updatePeopleState () {
		var dataStore = this.context.dataStore;

		this.setState({
			attendees: dataStore.getAttendees(),
			organisers: dataStore.getOrganisers(),
			speakers: dataStore.getSpeakers()
		});
	},

	updateSearch (str) {
		lastFilterSearch = str.toLowerCase();
		this.setState({ searchString: lastFilterSearch });
	},

	toggleStarred () {
		var onlyStarred = !this.state.onlyStarred;
		lastFilterStarred = onlyStarred;

		this.setState({ onlyStarred: onlyStarred });
		this.context.app.navigationBars.main.update(getNavigation({}, onlyStarred));
	},

	render () {
		var me = this.context.dataStore.getMe();
		var authed = me && me.name;
		var search = this.state.searchString;
		var onlyStarred = this.state.onlyStarred;

		function searchFilter (person) {
			return new RegExp(search).test(person.name.toLowerCase());
		}

		function starredFilter (person) {
			return !onlyStarred || person.starred;
		}

		var attendees = [];
		var attendeeCount = 0;
		var organisers = this.state.organisers.filter(searchFilter).filter(starredFilter);
		var speakers = this.state.speakers.filter(searchFilter).filter(starredFilter);

		if (authed && search || this.state.onlyStarred) {
			attendees = this.state.attendees.filter(searchFilter).filter(starredFilter);
			attendeeCount = attendees.length;
			if (search) {
				attendees = attendees.slice(0,15);
			}
		}

		var results;
		var noResults = !attendees.length && !organisers.length && !speakers.length;
		if (noResults) {
			var noResultsText = search ? ('No results for "' + this.state.searchString + '"') : 'Go star some people :)';
			var noResultsIcon = search ? 'no-results__icon ion-ios-search-strong' : 'no-results__icon ion-ios-star';

			results = (
				<Container direction="column" align="center" justify="center" className="no-results">
					<div className={noResultsIcon} />
					<div className="no-results__text">{noResultsText}</div>
				</Container>
			);
		} else {
			var attendeesMessage;
			var displayAttendees = [];
			if (!authed) {
				attendeesMessage = <div className="search-attendees-message">If you're at the conference, scan your Ticket QR to set up your profile and connect with other attendees.</div>;
			} else if (search && attendeeCount > attendees.length) {
				var notDisplayedCount = attendeeCount - attendees.length;
				attendeesMessage = <div className="search-attendees-message">{notDisplayedCount} more {notDisplayedCount === 1 ? 'person' : 'people'} matching {search}... be more specific.</div>;
			} else if (!search && !onlyStarred) {
				attendeesMessage = <div className="search-attendees-message">To find attendees use the searchbar above.<br /><br />If you can't find someone, make sure they've registered their app and made their profile public.</div>;
			}
			results = (
				<Container fill scrollable={scrollable} ref="scrollContainer">
					<PeopleList people={organisers} heading="Organisers" headingIsSticky previousView="people" />
					<PeopleList people={speakers} heading="Speakers" headingIsSticky previousView="people" />
					<PeopleList people={attendees.slice(0,20)} heading="Attendees" headingIsSticky previousView="people" />
					{attendeesMessage}
				</Container>
			);
		}

		return (
			<Container direction="column">
				<Search searchString={this.state.searchString} onChange={this.updateSearch} />
				{results}
			</Container>
		);
	}
});
