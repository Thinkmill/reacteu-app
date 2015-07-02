var React = require("react")

module.exports = React.createClass({
	displayName: "Scanner",
	propTypes: {
		action: React.PropTypes.func
	},
	getInitialState () {
		return {}
	},
	componentDidMount () {
		var action = this.props.action

		if (!window.cordova) {
			return action(new Error("QR code scanner is not available"))
		}

		window.cordova.plugins.barcodeScanner.scan(
			function(result) {
				if (result.cancelled) return action(undefined)

				// vibrate for 200ms
				window.navigator.vibrate(200)

				setTimeout(function() {
					action(undefined, result.text)
				}, 200)
			},
			function(err) {
				setTimeout(function() {
					action(err)
				}, 200)
			}
		)
	},
	render () {
		return (
			<div></div>
		)
	}
})
