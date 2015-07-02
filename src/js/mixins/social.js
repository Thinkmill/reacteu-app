var React = require('react');
var Tappable = require('react-tappable');

var device = require('../lib/device')

module.exports = {
	openFacebook (handle, pageId) {
		if (!window.plugins) return window.alert('Sorry, this functionality requires a mobile device.')
		pageId = pageId || 1541044122821917; // ReactEurope default

		var scheme = {
			'Android': 'fb://',
			'iOS': 'com.facebook.katana'
		}[device.platform]

		window.appAvailability.check(
			scheme,
			function () {
				window.location.href = 'fb://profile/' + pageId;
			},
			function () {
				window.open('https://www.facebook.com/' + handle, '_blank', 'toolbar=yes,location=no,transitionstyle=coververtical');
			}
		);
	},

	openGithub (handle) {
		window.open('https://www.github.com/' + handle, '_blank', 'toolbar=yes,location=no,transitionstyle=coververtical');
	},

	openTwitter (handle) {
		if (!window.plugins) return window.alert('Sorry, this functionality requires a mobile device.');

		var scheme = {
			'Android': 'com.twitter.android',
			'iOS': 'twitter://'
		}[device.platform]

		window.appAvailability.check(
			scheme,
			function () {
				window.location.href = 'twitter://user?screen_name=' + handle;
			},
			function () {
				window.open('https://twitter.com/' + handle, '_blank', 'toolbar=yes,location=no,transitionstyle=coververtical');
			}
		);
	},

	renderTwitter (handle) {
		return (
			<Tappable onTap={this.openTwitter.bind(this, handle)} className="PersonDetails__profile">
				<span className="PersonDetails__profile__icon ion-social-twitter" />
				@{handle}
			</Tappable>
		);
	},

	renderGithub (handle) {
		return (
			<Tappable onTap={this.openGithub.bind(this, handle)} className="PersonDetails__profile">
				<span className="PersonDetails__profile__icon ion-social-github" />
				{handle}
			</Tappable>
		);
	}
}
