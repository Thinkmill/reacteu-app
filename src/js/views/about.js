var animation = require('../touchstone/animation');
var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');

const scrollable = Container.initScrollable();

module.exports = React.createClass({
	displayName: 'ViewAbout',
	contextTypes: { dataStore: React.PropTypes.object.isRequired },
	mixins: [animation.Mixins.ScrollContainerToTop],

	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'About'
			}
		}
	},

	getDefaultProps () {
		return {
			aboutButtonLink: 'http://thinkmill.com.au/',
			aboutButtonLabel: 'Learn More'
		}
	},

	handleButton () {
		window.open(this.props.aboutButtonLink, '_blank', 'toolbar=yes,location=no,transitionstyle=coververtical');
	},

	render () {
		var settings = this.context.dataStore.getSettings()

		return (
			<Container scrollable={scrollable} className="About" ref="scrollContainer">
				<div className="About-section">
					<img src={settings.aboutLogo} className="About__logo" />
					<div className="About__heading">Made by Thinkmill</div>
					<div className="About__subheading">using these great tools</div>
					<div className="About__tools About__list">
						<div className="About__tool About__list__item"><img src="./img/touchstone-logo.svg" alt="TouchstoneJS" /></div>
						<div className="About__tool About__list__item"><img src="./img/react-logo.svg" alt="React.js" /></div>
						<div className="About__tool About__list__item"><img src="./img/keystone-logo.svg" alt="KeystoneJS" /></div>
						<div className="About__tool About__list__item"><img src="./img/cordova-logo.png" alt="Cordova" /></div>
					</div>
					<div className="About__content" dangerouslySetInnerHTML={{__html: settings.aboutContent }} />
					<Tappable onTap={this.handleButton} className="About__button button">{this.props.aboutButtonLabel}</Tappable>
				</div>
				<div className="About-section">
					<div className="About__subheading">Project Team</div>
					<div className="About__team About__list">
						<div className="About__team__member About__list__item">
							<img src="./img/team/boris-bozic.jpeg" alt="Boris Bozic" />
							Boris
						</div>
						<div className="About__team__member About__list__item">
							<img src="./img/team/daniel-cousens.jpg" alt="Daniel Cousens" />
							Daniel
						</div>
						<div className="About__team__member About__list__item">
							<img src="./img/team/jed-watson.png" alt="Jed Watson" />
							Jed
						</div>
						<div className="About__team__member About__list__item">
							<img src="./img/team/joss-mackison.png" alt="Joss Mackison" />
							Joss
						</div>
					</div>
				</div>
			</Container>
		);
	}
});

