var React = require('react');
var { Link } = require('../touchstone');

var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'PeopleItem',

	render () {
		var person = this.props.person;
		var bio = person.bio
		if (bio.length > 50) bio = bio.slice(0, 50) + '...'

		// FIXME: @jossmac
		var starClassName = classnames({
			'PersonItem__star': !this.props.person.starred,
			'PersonItem__starred': this.props.person.starred
		})

		return (
			<Link to="main:person" transition="show-from-right" viewProps={{ person: person, previousView: this.props.previousView }} className="ListItem Person" component="div">
				<img src={person.picture} className="ListItem__avatar PersonItem__avatar" />
				<div className="ListItem__content">
					<div className="ListItem__heading">
						{person.name}
						<span className={starClassName} />
					</div>
					<div className="ListItem__text">{bio}</div>
				</div>
				<div className="ListItem__chevron" />
			</Link>
		);
	}
});

