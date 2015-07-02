var classnames = require('classnames');
var Blink = require('react-blink');
var moment = require('moment');
var React = require('react');
var { Link } = require('../../touchstone');

module.exports = React.createClass({
	displayName: 'ScheduleItem',
	contextTypes: {
		dataStore: React.PropTypes.object.isRequired
	},

	propTypes: {
		onNow: React.PropTypes.bool,
		finished: React.PropTypes.bool,
		talk: React.PropTypes.object.isRequired
	},

	renderSpeakers () {
		var dataStore = this.context.dataStore
		var speakerIds = this.props.talk.speakers;
		var speakers = speakerIds.map(speakerId => dataStore.getPerson(speakerId)).filter(speaker => speaker)

		return speakers.map((speaker, i) => {
			return <img className="ListItem__avatar ScheduleItem__avatar-img" key={'avatar_' + i} src={speaker.picture}/>
		})
	},

	render () {
		var onNow = this.props.onNow ? <Blink className="ScheduleItem__now">On Now</Blink> : null;
		var talk = this.props.talk;
		var linkClassName = classnames('ListItem ScheduleItem', {
			'is-past': this.props.finished
		}, ('ScheduleItem--' + talk.type));
		var avatarWrapperClassName = classnames('ScheduleItem__avatar', {
			'ScheduleItem__avatar--multiple': talk.speakers.length > 1
		});
		var renderTheDisclosureArrow = (talk.type === 'talk') ? <span className="ScheduleItem__avatar-chevron ion-chevron-right" /> : null;
		var startTime = moment(talk.startTime).utcOffset('+0200').format('h:mma')

		return (
			<Link to="main:talk" transition="show-from-right" viewProps={{ talk: talk }} className={linkClassName} component="div">
				<div className="ListItem__content ScheduleItem__content">
					{onNow}
					<div className="ListItem__text ScheduleItem__text">{startTime}</div>
					<div className="ListItem__heading ScheduleItem__heading">{talk.title}</div>
				</div>
				<div className={avatarWrapperClassName}>
					{this.renderSpeakers()}
					{renderTheDisclosureArrow}
				</div>
			</Link>
		);
	}
});

