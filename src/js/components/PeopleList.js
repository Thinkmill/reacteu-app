var React = require('react');
var blacklist = require('blacklist');

var ListHeader = require('../components/ListHeader');
var PeopleItem = require('./PeopleItem');

module.exports = React.createClass({
	displayName: 'PeopleList',
	propTypes: {
		heading: React.PropTypes.string,
		headingIsSticky: React.PropTypes.bool,
		people: React.PropTypes.array,
		previousView: React.PropTypes.string
	},

	getDefaultProps () {
		return {
			previousView: 'people'
		};
	},

	render () {
		if (!this.props.people.length) return null;

		var people = this.props.people;
		var previousView = this.props.previousView;
		var items = people.map(function (person, i) {
			return <PeopleItem key={'person_' + i} person={person} previousView={previousView} />;
		});

		var heading = this.props.heading ? <ListHeader sticky={this.props.headingIsSticky}>{this.props.heading}</ListHeader> : null;
		var props = blacklist(this.props, 'heading', 'headingIsSticky', 'people');

		return (
			<div {...props}>
				{heading}
				{items}
			</div>
		);
	}
});
