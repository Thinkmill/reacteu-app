var Container = require('react-container');
var React = require('react');
var moment = require('moment');
var Social = require('../../mixins/social')
var Tappable = require('react-tappable');
var { animation, Link, Transitions } = require('../../touchstone');

var Sentry = require('react-sentry');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

function getNavigation2 (props) {
	var leftLabel = 'People';
	if (props.previousView === 'event') {
		leftLabel = 'Event';
	} else if (props.previousView === 'talk') {
		leftLabel = 'Talk';
	}

	return {
		leftArrow: true,
		leftLabel: leftLabel,
		leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
		rightIcon: props.person.starred ? 'ion-ios-star' : 'ion-ios-star-outline',
		rightAction: emitter.emit.bind(emitter, 'navigationBarRightAction'),
		title: 'Person'
	}
}

module.exports = React.createClass({
	displayName: 'ViewPerson',
	contextTypes: {
		dataStore: React.PropTypes.object.isRequired
	},
	mixins: [Sentry(), Transitions, Social, animation.Mixins.ScrollContainerToTop],

	statics: {
		navigationBar: 'main',
		getNavigation: getNavigation2
	},

	getDefaultProps () {
		return {
			previousView: 'people'
		};
	},

	componentDidMount () {
		var self = this;
		var gotoView = 'main:tabs';

		if (this.props.previousView === 'talk') {
			gotoView = 'main:talk';
		}
			
		// android backbutton handler
		this.watch(document, 'backbutton', function () {
			self.transitionTo(gotoView, {
				transition: 'reveal-from-right',
				viewProps: self.props.previousViewProps
			});
		});

		// navbar actions
		this.watch(emitter, 'navigationBarLeftAction', function () {
			self.transitionTo(gotoView, {
				transition: 'reveal-from-right',
				viewProps: self.props.previousViewProps
			});
		});

		this.watch(emitter, 'navigationBarRightAction', this.starThisUser);
	},

	starThisUser () {
		this.context.dataStore.star(this.props.person.id, !this.props.person.starred)
		this.context.app.navigationBars.main.update(getNavigation2(this.props))
	},

	renderTalk () {
		var person = this.props.person;
		if (!person.talks) return;
		if ((this.props.previousView === 'talk') || (this.props.previousView === 'event')) return;

		return person.talks.map((talk, i) => {
			var viewProps = {
				previousView: 'person',
				previousViewProps: this.props,
				talk: talk
			}
			var talkTime = moment(talk.startTime).utcOffset('+0200').format('h:mma')

			return (
				<Link key={'talk_' + i} to="main:talk" transition="show-from-right" viewProps={viewProps} className="Footerbar PersonDetails__talk" component="div">
					<div className="PersonDetails__talk-inner">
						<div className="PersonDetails__talk__time">{talkTime}</div>
						<div className="PersonDetails__talk__title">{talk.title}</div>
					</div>
					<div className="PersonDetails__talk-chevron ion-chevron-right" />
				</Link>
			);
		})
	},

	render () {
		var person = this.props.person;
		var github = person.github && this.renderGithub(person.github)
		var twitter = person.twitter && this.renderTwitter(person.twitter)

		return (
			<Container direction="column">
				<Container fill scrollable ref="scrollContainer" className="PersonDetails">
					<img src={person.picture} className="PersonDetails__avatar" />
					<div className="PersonDetails__heading">{person.name}</div>
					<div className="PersonDetails__text text-block">{person.bio}</div>
					{(person.twitter || person.github) && <div className="PersonDetails__profiles">
						{twitter}
						{github}
					</div>}
				</Container>
				{this.renderTalk()}
			</Container>
		);
	}
});

