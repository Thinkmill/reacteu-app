var React = require('react');

export var animation = require('./animation');
export var Container = require('./Container');
export var Icon = require('./Icon');
export var LabelInput = require('./LabelInput');
export var LabelTextarea = require('./LabelTextarea');
export var Link = require('./Link');
export var NavigationBar = require('./NavigationBar');
export var Switch = require('./Switch');
export var Tabs = require('./Tabs');
export var Transitions = require('./Transitions');
export var View = require('./View');
export var ViewManager = require('./ViewManager');

export function createApp() {
	var app = {
		navigationBars: {},
		viewManagers: {},
		views: {}
	};
	
	return {
		childContextTypes: {
			app: React.PropTypes.object
		},
		getChildContext () {
			return {
				app: app
			};
		}
	};
}
