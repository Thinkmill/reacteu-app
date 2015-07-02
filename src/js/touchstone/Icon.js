var React = require('react');

var Icon = React.createClass({
	render () {
		return (
			<div className="Icon">
				{this.props.children}
			</div>
		);
	}
});

export default Icon;
