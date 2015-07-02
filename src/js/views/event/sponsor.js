var React = require('react');
var Tappable = require('react-tappable');

module.exports = React.createClass({
	displayName: 'Sponsor',

	propTypes: {
		image: React.PropTypes.string,
		name: React.PropTypes.string,
		description: React.PropTypes.string,
		summary: React.PropTypes.string,
		tier: React.PropTypes.string,
		lite: React.PropTypes.bool,
		url: React.PropTypes.string
	},

	getInitialState () {
		return {
			isExpanded: false
		};
	},

	toggleFullText () {
		this.setState({ isExpanded: !this.state.isExpanded });
	},

	openURL () {
		window.open(this.props.website, '_blank', 'toolbar=yes,location=no,transitionstyle=coververtical');
	},

	render () {
		var expanse

		// if (!this.props.lite) {
		// 	var isExpanded = this.state.isExpanded
		// 	var sponsorText = isExpanded ? this.props.description : this.props.summary.slice(0, 80) + ' ...'
		// 	var tappable = isExpanded ? (
		// 		<Tappable onTap={this.openURL} className="EventInfo__sponsor__button EventInfo__sponsor__button--link">View Website</Tappable>
		// 	) : (
		// 		<Tappable onTap={this.toggleFullText} className="EventInfo__sponsor__button EventInfo__sponsor__button--disclosure ion-chevron-down" component="div" />
		// 	);

		// 	expanse = (
		// 		<div>
		// 			<div className="EventInfo__sponsor__text">{sponsorText}</div>
		// 			{tappable}
		// 		</div>
		// 	)
		// }

		return (
			<div className={'EventInfo__sponsor--' + this.props.tier}>
				<div className="EventInfo__sponsor__image">
					<img src={this.props.image} alt={this.props.name} />
				</div>
				{expanse}
			</div>
		);
	}
});
