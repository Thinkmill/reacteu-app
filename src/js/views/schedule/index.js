var animation = require('../../touchstone/animation');
var Container = require('react-container');
var Sentry = require('react-sentry');
var React = require('react');
var Timers = require('react-timers');

var ListHeader = require('../../components/ListHeader');
var ScheduleItem = require('./item');

var moment = require('moment');
const scrollable = Container.initScrollable();

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

module.exports = React.createClass({
	displayName: 'Schedule',
	contextTypes: {
		dataStore: React.PropTypes.object.isRequired
	},
	mixins: [Sentry(), Timers(), animation.Mixins.ScrollContainerToTop],

	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				leftIcon: 'ion-android-menu',
				leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
				title: 'Schedule'
			}
		}
	},

	getInitialState () {
		return {
			schedule: this.context.dataStore.getSchedule(),
			searchString: '',
			timeNow: window.timeNow || Date.now()
		}
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

		// watch the local store and update when the schedule changes
		this.watch(this.context.dataStore, 'update-schedule', this.updateScheduleState);

		// hard-update every minute to update "on now" indicator for talks
		this.setInterval(() => {
			// FIXME: remove, window.timeNow is for debugging
			this.setState({ timeNow: window.timeNow || Date.now() })
		}, 60 * 1000)
	},

	updateScheduleState () {
		this.setState({
			schedule: this.context.dataStore.getSchedule()
		});
	},

	render () {
		var days = [];
		var currentDay;
		var timeNow = this.state.timeNow;

		this.state.schedule.forEach(function (scheduleItem, i) {
			var itemDayName = moment(scheduleItem.startTime).utcOffset('+0200').format('dddd');

			if (!currentDay || currentDay.name !== itemDayName) {
				currentDay = { name: itemDayName, items: [] };
				days.push(currentDay);
			}

			var begun = timeNow > new Date(scheduleItem.startTime).getTime();
			var finished = timeNow > new Date(scheduleItem.endTime).getTime();
			var onNow = begun && !finished;

			// note: real-time integration is disabled now the event is over

			currentDay.items.push({
				details: scheduleItem,
				begun: false, // begun,
				finished: false, // finished,
				onNow: false // onNow
			});
		});

		return (
			<Container scrollable={scrollable} ref="scrollContainer">
				{days.map((day, i) => {
					return (<div key={'day' + i}>
						<ListHeader key={'schedule_header_' + day.name} sticky>{day.name}</ListHeader>
						{day.items.map((item, i) => {
							return (<ScheduleItem key={'schedule_' + i} talk={item.details} finished={item.finished} onNow={item.onNow} />)
						})}
					</div>)
				})}
			</Container>
		);
	}
});
