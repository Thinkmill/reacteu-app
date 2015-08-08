var React = require('react/addons');
var Sentry = require('react-sentry');
var {
	createApp,
	Container,
	NavigationBar,
	Tabs,
	ViewManager,
	View
} = require('./touchstone');

var DataStore = require('./stores/DataStore');
var dataStore = new DataStore();
window.dataStore = dataStore;

var device = require('./lib/device');

function hideSplashScreen () {
	try {
		navigator.splashscreen.hide();
	} catch(e) {}
}

function blockBodyTouchMove (e) {
	var currentTarget = e.target;
	while (currentTarget && currentTarget !== document.body) {
		if (currentTarget.scrollHeight > currentTarget.offsetHeight) {
			// we found a scrollable area; allow it.
			return;
		}
		currentTarget = currentTarget.parentNode;
	}
	// no scrollable parent elements; prevent the move.
	e.preventDefault();
}

function bindBlockBodyTouchMove () {
	window.addEventListener('touchmove', blockBodyTouchMove);
}

function unbindBlockBodyTouchMove () {
	window.removeEventListener('touchmove', blockBodyTouchMove);
}

var lastWindowHeight = 0;
var keyboardIsVisible = false;

function updateAppHeight(h) {
	if (typeof h === 'number') h = h + 'px';
	document.getElementById('app').style.height = h;
};

function fixWindowHeight () {
	var resetAppHeight = function() {
		if (keyboardIsVisible || window.innerHeight === lastWindowHeight) return;
		lastWindowHeight = window.innerHeight;
		updateAppHeight(lastWindowHeight);
		// if the iOS in-call status bar is visible, this fixes the scrolling
		// bug that's present on the document body.
		if (document.body.scrollHeight > window.innerHeight) {
			bindBlockBodyTouchMove();
		} else {
			unbindBlockBodyTouchMove();
		}
	}
	resetAppHeight();
	setInterval(resetAppHeight, 250);
}

function keyboardShowHandler(e) {
	keyboardIsVisible = true;
	delete document.getElementById('app').style.height;
    console.log('Keyboard height is: ' + e.keyboardHeight + ', window height is: ' + window.innerHeight + ', last window height is: ' + lastWindowHeight);
}

function keyboardHideHandler(e) {
	keyboardIsVisible = false;
	updateAppHeight(lastWindowHeight);
    console.log('Keyboard is hidden, window height is: ' + window.innerHeight + ', last window height is: ' + lastWindowHeight);
}

var App = React.createClass({
	mixins: [createApp(), Sentry()],

	childContextTypes: {
		dataStore: React.PropTypes.object
	},

	getChildContext () {
		return {
			dataStore: dataStore
		};
	},

	getInitialState () {
		return {
			defaultView: dataStore.amRegistered() ? 'main' : 'onboarding'
		};
	},

	componentDidMount () {
		// Delay the splash screen fade to allow for initial render to complete
		setTimeout(hideSplashScreen, 1000);

		this.watch(dataStore, 'update-settings', this.updateAppState);
		this.watch(document, 'backbutton', function (e) {
			e.preventDefault();
			return console.info('Do nothing by default; where applicable views have their own back button handler.');
		});

		var settings = dataStore.getSettings();
		if (!settings.kill) return;

		this.updateAppState(settings);
	},

	updateAppState (settings) {
		if (!settings.kill) return;

		this.refs.vm.transitionTo('announcement', {
			viewProps: settings.kill
		});
	},

	render () {
		var appWrapperClassName = 'app-wrapper device--' + device.platform;

		return (
			<div className={appWrapperClassName}>
				<div className="device-silhouette">
					<ViewManager ref="vm" name="app" defaultView={this.state.defaultView}>
						<View name="onboarding" component={require('./views/onboarding/index')} />
						<View name="onboarding-resend-email" component={require('./views/onboarding/resend-email')} />
						<View name="onboarding-enter-code" component={require('./views/onboarding/enter-code')} />
						<View name="main" component={MainViewController} />
						<View name="announcement" component={require('./views/announcement')} />
					</ViewManager>
				</div>
			</div>
		);
	}
});

var MainViewController = React.createClass({
	render () {
		return (
			<Container>
				<NavigationBar name="main" />
				<ViewManager name="main" defaultView="tabs">
					<View name="tabs" component={TabViewController} />
					<View name="person" component={require('./views/people/person')} />
					<View name="talk" component={require('./views/schedule/talk')} />
				</ViewManager>
			</Container>
		);
	}
});

var lastSelectedTab = 'me';
var TabViewController = React.createClass({
	contextTypes: { dataStore: React.PropTypes.object.isRequired },
	mixins: [Sentry()],

	getInitialState () {
		var showAboutView = this.context.dataStore.getSettings().showAboutView;
		var theBigReveal = Date.now() > new Date('Wed, 03 Jul 2015 10:00:00 GMT').getTime();

		return {
			selectedTab: lastSelectedTab,
			showAboutView: showAboutView || theBigReveal
		};
	},

	componentDidMount () {
		// android backbutton handler
		this.watch(document, 'backbutton', () => {
 				var body = document.getElementsByTagName('body')[0];
 				body.classList.remove('android-menu-is-open');
		});

		this.watch(dataStore, 'update-settings', this.updateTabState);
	},

	onViewChange (nextView) {
		lastSelectedTab = nextView;

		this.setState({
			selectedTab: nextView
		});
	},

	updateTabState (settings) {
		this.setState({
			showAboutView: settings.showAboutView
		});
	},

	selectTab (tab) {
		var viewProps;

		if (tab.value === 'me') {
			viewProps = {
				me: this.context.dataStore.getMe()
			};
		}

		this.refs.vm.transitionTo(tab.value, {
			viewProps: viewProps
		});
	},

	renderAboutTab () {
		if (!this.state.showAboutView) return <span />;

		return (
			<Tabs.Tab value="about">
				<span className="Tabs-Icon Tabs-Icon--about" />
				<Tabs.Label>About</Tabs.Label>
			</Tabs.Tab>
		);
	},

	render () {
		var selectedTab = this.state.selectedTab;
		if (selectedTab === 'me' || selectedTab === 'me-edit') {
			selectedTab = 'me';
		}

		var me = this.context.dataStore.getMe();

		return (
			<Container>
				<ViewManager ref="vm" name="tabs" defaultView={this.state.selectedTab} onViewChange={this.onViewChange}>
					<View name="schedule" component={require('./views/schedule')} />
					<View name="people" me={me} component={require('./views/people')} />
					<View name="event" component={require('./views/event')} />
					<View name="me" me={me} component={require('./views/me')} />
					<View name="me-edit" component={require('./views/me/edit')} />
					<View name="about" component={require('./views/about')} />
				</ViewManager>
				<Tabs.Navigator value={selectedTab} onChange={this.selectTab}>
					<Tabs.Tab value="schedule">
						<span className="Tabs-Icon Tabs-Icon--schedule" />
						<Tabs.Label>Schedule</Tabs.Label>
					</Tabs.Tab>
					<Tabs.Tab value="people">
						<span className="Tabs-Icon Tabs-Icon--people" />
						<Tabs.Label>People</Tabs.Label>
					</Tabs.Tab>
					<Tabs.Tab value="event">
						<span className="Tabs-Icon Tabs-Icon--event" />
						<Tabs.Label>Event</Tabs.Label>
					</Tabs.Tab>
					<Tabs.Tab value="me">
						<span className="Tabs-Icon Tabs-Icon--me" />
						<Tabs.Label>Me</Tabs.Label>
					</Tabs.Tab>
					{this.renderAboutTab()}
				</Tabs.Navigator>
			</Container>
		);
	}
});

function startApp () {
	if (window.StatusBar) {
		window.StatusBar.styleLightContent();
	}
	fixWindowHeight();
	React.render(<App />, document.getElementById('app'));
}

// native? wait for deviceready
if (window.cordova) {
	window.addEventListener('native.keyboardshow', keyboardShowHandler);
	window.addEventListener('native.keyboardhide', keyboardHideHandler);
	document.addEventListener('deviceready', startApp, false);

// browser, start asap
} else {
	startApp();
}
