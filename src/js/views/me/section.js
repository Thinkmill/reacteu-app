var React = require('react');
var Container = require('react-container');
var { animation, Link, Transitions } = require('../../touchstone');

module.exports = React.createClass({
  mixins: [Transitions, animation.Mixins.ScrollContainerToTop],
  displayName: 'Me Section',
  propTypes: {
    registerLink: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    ticketCode: React.PropTypes.string
  },
  render: function () {
    // If they aren't registered, show a registration button
    if (!this.props.ticketCode) {
      return (
        <Container align="center" className="MeRegistration__section">
					<div className="MeRegistration__heading">{this.props.title}</div>
					<p className="MeRegistration__intro">Register your {this.props.title} ticket!</p>
					<Link to={this.props.registerLink} transition="fade" className="MeRegistration__footer-button">Register</Link>
				</Container>
      );
    }

    var qrUrl = 'https://chart.googleapis.com/chart?cht=qr&chl=' + this.props.ticketCode + '&chs=400x400';

    return (
      <Container align="center" className="MeRegistration__section">
        <div className="MeRegistration__heading">{this.props.title}</div>
        <div className="entry-code__heading">Please show this to gain entry:</div>
        <img src={qrUrl} className="entry-code__image" />
        <div className="entry-code__text">{this.props.ticketCode.toUpperCase()}</div>
      </Container>
    );
  }
})
