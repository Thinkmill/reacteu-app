var React = require('react')
var Container = require('react-container');

var classnames = require('classnames')

module.exports = React.createClass({
	propTypes: {
		icon: React.PropTypes.string,
		text: React.PropTypes.string,
		subText: React.PropTypes.string
	},

	getDefaultProps () {
		return {
			icon: 'ion-sad-outline',
			text: 'Sorry!',
			subText: "Something has gone wrong, you may need to update this app to continue..."
		}
	},

	render () {
		var iconClassName = classnames('ErrorView__icon', this.props.icon);

		return (
			<Container fill align="center" justify="center" scrollable direction="column" className="View ErrorView">
				<div className={iconClassName} />
				<div className='ErrorView__heading'>{this.props.text}</div>
				<div className='ErrorView__text'>{this.props.subText}</div>
			</Container>
		);
	}
})
