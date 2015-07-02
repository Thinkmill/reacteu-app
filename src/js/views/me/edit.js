var React = require('react');
var Container = require('react-container');
var Sentry = require('react-sentry');
var { animation, LabelInput, LabelTextarea, Switch, Transitions } = require('../../touchstone');

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

module.exports = React.createClass({
	displayName: 'ViewMe-edit',
	contextTypes: { dataStore: React.PropTypes.object.isRequired },
	mixins: [Sentry(), Transitions, animation.Mixins.ScrollContainerToTop],

	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				leftIcon: 'ion-android-menu',
				leftAction: emitter.emit.bind(emitter, 'navigationBarLeftAction'),
				title: 'Me'
			}
		}
	},

	getInitialState () {
		return this.context.dataStore.getMe();
	},

	componentDidMount () {
		this.watch(this.context.dataStore, 'update-me', this.updateMeState);

		// android backbutton handler
		this.watch(document, 'backbutton', () => {
			this.transitionTo('tabs:me', {
				transition: 'fade',
				viewProps: {
					me: this.state
				}
			});
		})

		var body = document.getElementsByTagName('body')[0];
		var menuWrapper = document.getElementsByClassName('Tabs-Navigator-wrapper')[0];
		body.classList.remove('android-menu-is-open');
		menuWrapper.addEventListener('click', function (e) {
			body.classList.remove('android-menu-is-open');
		});

		// navbar actions
		this.watch(emitter, 'navigationBarLeftAction', function () {
			body.classList.toggle('android-menu-is-open');
		});
	},

	componentWillUnmount () {
		this.context.dataStore.editMe(this.state);
		this.context.dataStore.synchronize();
	},

	updateMeState (me) {
		this.setState(me);
	},

	onChange (field, event) {
		var state = {};
		state[field] = event.target.value;
		this.setState(state);
	},

	togglePublic () {
		this.setState({ isPublic: !this.state.isPublic });
	},

	render () {
		return (
			<Container scrollable ref="scrollContainer">
				<div className="PersonDetails">
					<div><img src={this.state.picture} className="PersonDetails__avatar" /></div>
					<div className="PersonDetails__heading">{this.state.name}</div>
				</div>
				<div className="panel">
					<label className="list-item field-item">
						<div className="item-inner">
							<div className="field-label">Public</div>
							<Switch onTap={this.togglePublic} on={this.state.isPublic} />
						</div>
					</label>
				</div>
				<div className="panel">
					<LabelInput onChange={this.onChange.bind(this, 'twitter')} name="twitter" label="Twitter" defaultValue={this.state.twitter} />
					<LabelInput onChange={this.onChange.bind(this, 'github')} name="github" label="GitHub" defaultValue={this.state.github} />
				</div>
				<div className="panel">
					<LabelTextarea onChange={this.onChange.bind(this, 'bio')} name="bio" label="Bio" defaultValue={this.state.bio} rows={6} />
				</div>
			</Container>
		);
	}
});

