var Container = require('react-container');
var FeedbackModal = require('../../components/FeedbackModal');
var moment = require('moment');
var React = require('react');
var Tappable = require('react-tappable');
var { Link, Transitions } = require('../../touchstone');

var Sentry = require('react-sentry');
var EventEmitter = require('events').EventEmitter;

var classnames = require('classnames')
var emitter = new EventEmitter();

function getNavigation (props) {
	var leftLabel = 'Schedule';
	if (props.previousView === 'person') {
		leftLabel = 'Person';
	}

	return {
		leftArrow: true,
		leftLabel: leftLabel,
		leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
		rightArrow: false,
		rightAction: null,
		title: 'Talk'
	}
}

module.exports = React.createClass({
	displayName: 'Talk',
	mixins: [Sentry(), Transitions],
	contextTypes: {
		dataStore: React.PropTypes.object.isRequired
	},

	statics: {
		navigationBar: 'main',
		getNavigation: getNavigation
	},

	getDefaultProps () {
		return {
			previousView: 'schedule'
		};
	},

	getInitialState () {
		return {
			feedbackModalIsVisible: false,
			feedbackType: this.props.talk.feedback.type || '',
			feedbackText: this.props.talk.feedback.text || '',
			online: window.navigator.onLine
		};
	},

	componentDidMount () {
		var self = this;
		var gotoView = 'main:tabs:schedule';
		if (this.props.previousView === 'person') {
			gotoView = 'main:person';
		}

		// android backbutton handler
		this.watch(document, 'backbutton', function () {
			self.transitionTo(gotoView, {
				transition: 'reveal-from-right',
				viewProps: self.props.previousViewProps
			});
		});

		// navbar actions
		this.watch(emitter, 'navigationBarLeftAction', () => {
			self.transitionTo(gotoView, {
				transition: 'reveal-from-right',
				viewProps: self.props.previousViewProps
			});
		});

		// online status
		this.watch(window, 'online', this.updateOnlineStatus);
		this.watch(window, 'offline', this.updateOnlineStatus);
	},

	updateOnlineStatus (event) {
		this.setState({
			online: window.navigator.onLine
		});
	},

	tweetThisTalk () {
		if (!window.plugins) return window.alert('Sorry, sharing is not available with this device.')

		var dataStore = this.context.dataStore
		var eventTwitter = dataStore.getSettings().eventTwitter;
		var speakers = this.props.talk.speakers.map(speakerId => dataStore.getPerson(speakerId));
		var speakerText = speakers.map(speaker => speaker.twitter ? ('@' + speaker.twitter) : speaker.name).join(' and ');

		var preComposedTweet = 'Watching ' + speakerText + ' talk about ' + this.props.talk.title + ' at @' + eventTwitter;

		return window.plugins.socialsharing.shareViaTwitter(preComposedTweet);
	},

	submitFeedback (e) {
		this.closeFeedbackModal();

		this.context.dataStore.feedback(this.props.talk.id, {
			type: this.state.feedbackType,
			text: this.state.feedbackText
		});
	},

	openFeedbackModal () {
		var scrollableContainer = this.refs.scrollableContainer.getDOMNode();

		this.setState({ feedbackModalIsVisible: true }, function () {
			scrollableContainer.style.overflow = 'hidden'
		});
	},

	closeFeedbackModal () {
		var scrollableContainer = this.refs.scrollableContainer.getDOMNode();

		this.setState({ feedbackModalIsVisible: false }, function () {
			scrollableContainer.style.overflow = 'scroll'
		});
	},

	updateFeedbackType (type) {
		this.setState({ feedbackType: type });
	},

	updateFeedbackText (e) {
		this.setState({ feedbackText: e.target.value });
	},

	cancelFeedback () {
		this.closeFeedbackModal();
		this.setState(this.getInitialState());
	},

	renderFeedbackModal () {
		var positiveButtonClass = classnames('FeedbackModal__button', 'FeedbackModal__button--positive', {
			'is-selected': this.state.feedbackType === 'positive'
		});
		var negativeButtonClass = classnames('FeedbackModal__button', 'FeedbackModal__button--negative', {
			'is-selected': this.state.feedbackType === 'negative'
		});
		var inputClass = classnames('FeedbackModal__body__input', {
			'has-value': this.state.feedbackText.length > 0
		});

		return (
			<FeedbackModal visible={this.state.feedbackModalIsVisible}>
				<div className="FeedbackModal__form">
					<div className="FeedbackModal__header">
						<div className="FeedbackModal__title">What did you think of this talk?</div>
						<div className="FeedbackModal__subtitle">Feedback is private and anonymous</div>
						<div className="FeedbackModal__buttons">
							<Tappable onTap={this.updateFeedbackType.bind(this, 'positive')} className={positiveButtonClass} />
							<Tappable onTap={this.updateFeedbackType.bind(this, 'negative')} className={negativeButtonClass} />
						</div>
					</div>
					<div className="FeedbackModal__body">
						<textarea value={this.state.feedbackText} onChange={this.updateFeedbackText} placeholder="Leave feedback for the speaker..." className={inputClass} />
					</div>
					<div className="FeedbackModal__footer">
						{this.state.online ? (
							<Tappable onTap={this.submitFeedback} className="FeedbackModal__footer__button FeedbackModal__footer__button--primary">Save</Tappable>
						) : (
							<span className="FeedbackModal__footer__button FeedbackModal__footer__button--disabled">Offline</span>
						)}
						<Tappable onTap={this.cancelFeedback} className="FeedbackModal__footer__button FeedbackModal__footer__button--link">Cancel</Tappable>
					</div>
				</div>
			</FeedbackModal>
		);
	},

	renderSpeakers () {
		var previousView = this.props.previousView;
		var dataStore = this.context.dataStore;
		var speakerIds = this.props.talk.speakers;
		var speakers = speakerIds.map(speakerId => dataStore.getPerson(speakerId)).filter(speaker => speaker);
		var self = this;

		return speakers.map(function (speaker, i) {
			var viewProps = {
				person: speaker,
				previousView: 'talk',
				previousViewProps: self.props
			};

			// if the user hasn't arrived from the person view, link through to the person
			// otherwise we create a weird loop
			return previousView === 'person' ? (
				<div className="TalkDetails__speaker" key={'speaker' + i}>
					<img src={speaker.picture} className="TalkDetails__speaker__avatar" />
					<div className="TalkDetails__speaker__name">{speaker.name}</div>
				</div>
			) : (
				<Link key={'speaker' + i} to="main:person" transition="show-from-right" className="TalkDetails__speaker" viewProps={viewProps} component="div">
					<img src={speaker.picture} className="TalkDetails__speaker__avatar" />
					<div className="TalkDetails__speaker__name">{speaker.name}</div>
					<span className="ion-chevron-right" />
				</Link>
			);
		});
	},

	render () {
		var talk = this.props.talk;
		var talkTime = moment(talk.startTime).utcOffset('+0200').format('h:mma');

		// handle feedback button / icon state
		var feedbackButtonClass = classnames('TalkDetails__button', 'button-table__item', {
			'is-disabled': !this.context.dataStore.amRegistered()
		});
		var feedbackButtonIcon = classnames('button-table__item__icon', {
			'TalkDetails__button__icon': this.state.feedbackType,
			'ion-thumbsup': !this.state.feedbackType,
			'ion-thumbsup is-positive': this.state.feedbackType === 'positive',
			'ion-thumbsdown is-negative': this.state.feedbackType === 'negative'
		});

		return (
			<Container fill>
				<Container scrollable className="TalkDetails" ref="scrollableContainer">
					<div className="TalkDetails__details">
						<div className="TalkDetails__text text-block">{talkTime}</div>
						<div className="TalkDetails__heading">{talk.title}</div>
						<div className="TalkDetails__speakers">
							{this.renderSpeakers()}
						</div>
						<div className="TalkDetails__text text-block" dangerouslySetInnerHTML={{__html: talk.description}} />
					</div>
					<div className="TalkDetails__buttons button-table">
						<Tappable onTap={this.tweetThisTalk} className="TalkDetails__button button-table__item">
							<span className="TalkDetails__button__icon button-table__item__icon ion-social-twitter" />
							<div className="button-table__item__label">Tweet this talk</div>
						</Tappable>
						<Tappable onTap={this.openFeedbackModal} className={feedbackButtonClass}>
							<span className={feedbackButtonIcon} />
							<div className="button-table__item__label">Leave feedback</div>
						</Tappable>
					</div>
				</Container>
				{this.renderFeedbackModal()}
			</Container>
		);
	}
});

