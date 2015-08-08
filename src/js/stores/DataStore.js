var EventEmitter = require('events').EventEmitter;

var async = require('async');
var defaultData = require('./default');
var defaults = require('defaults');
var httpify = require('httpify');

function DataStore () {
	EventEmitter.call(this);

	// assign localStorage to our internal cache
	var storage = this.cache = {};
	for (var key in window.localStorage) {
		storage[key] = JSON.parse(window.localStorage[key]);
	}

	// default our internal cache to pre-loaded data
	defaults(storage, defaultData);
	this.__preprocess(storage);

// 	TODO maybe window.addEventListener('online', this.updateOnlineStatus);
// 	TODO maybe window.addEventListener('offline', this.updateOnlineStatus);

	// generic API queue
	var self = this;
	var url = 'https://reacteu-api.herokuapp.com/api';
	this.apiQueue = async.queue(function (opts, callback) {
		var { authToken } = storage;
		var { endpoint, data } = opts;
		var packet = Object.assign({
			authToken: authToken || undefined
		}, data);

		httpify({
			method: 'POST',
			url: url + endpoint,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(packet),
			timeout: 20000
		}, (err, res) => {
			if (err) return callback(err);
			if (res.statusCode !== 200) return callback(new Error('Error ' + res.statusCode));

			var body = res.body || {};
			if (!body.success) return callback(new Error('API Error: ' + body.error));

			var data = body.data || {};
			self.__preprocess(data);

			// emit all the events
			for (var key in data) {
				var updated = data[key];

				storage[key] = updated;
				window.localStorage[key] = JSON.stringify(updated);

				self.emit('update-' + key, updated);
			}
			self.emit('update', data);

			callback(null, data);
		});
	}, 1)

	// every 30s, attempt synchronize, queues incase it takes a while
	self.synchronize();
	setInterval(function () {
		self.synchronize();
	}, this.cache.settings.refreshInterval || 30000);
}

// mutates data
DataStore.prototype.__preprocess = function (data) {
	if (data.people) {
		var starred = this.cache.starred;
		var talks = data.schedule || this.cache.schedule;

		data.people.forEach(person => {
			person.bio = person.bio || '';
			person.github = person.github || '';
			person.picture = person.picture || '';
			person.starred = starred[person.id];
			person.twitter = person.twitter || '';

			person.talks = talks.filter(talk => talk.speakers.indexOf(person.id) !== -1);
			person.isSpeaker = person.isSpeaker || person.talks.length > 0;
		});
	}

	if (data.schedule) {
		var feedback = this.cache.feedback;

		data.schedule.forEach(talk => {
			talk.feedback = feedback[talk.id] || {};
		});
	}
};

Object.assign(DataStore.prototype, EventEmitter.prototype);

// Synchronized, external API functions
DataStore.prototype.activate = function (ticketCode, callback) {
	this.cache.ticketCode = ticketCode;

	this.apiQueue.push({
		endpoint: '/me/activate',
		data: { ticketCode: ticketCode }
	}, callback || function () {});
};

DataStore.prototype.editMe = function (newMe, callback) {
	this.cache.me = newMe;
	this.apiQueue.push({
		endpoint: '/me/update',
		data: { me: newMe }
	}, callback || function () {});
};

DataStore.prototype.feedback = function (id, feedback, callback) {
	this.cache.feedback[id] = feedback;

	// update feedback cache
	this.cache.schedule.forEach(function (talk) {
		if (talk.id !== id) return;

		talk.feedback = feedback;
	});

	this.apiQueue.push({
		endpoint: '/me/feedback',
		data: Object.assign({ id: id }, feedback)
	}, callback || function () {})
};

DataStore.prototype.resend = function (email, callback) {
	this.apiQueue.push({
		endpoint: '/resend',
		data: { email: email }
	}, callback || function () {});
};

DataStore.prototype.synchronize = function (callback) {
	this.apiQueue.push({
		endpoint: '/synchronize',
		data: {
			timestamp: this.cache.timestamp
		}
	}, callback || function () {});
};

// Unsynchronized, non external API functions
DataStore.prototype.star = function (id, starred) {
	this.cache.starred[id] = starred;

	// update people cache
	this.cache.people.forEach(function (person) {
		if (person.id !== id) return;

		person.starred = starred;
	});

	window.localStorage.starred = JSON.stringify(this.cache.starred);
};

DataStore.prototype.amRegistered = function () { return !!this.cache.authToken };
DataStore.prototype.getAttendees = function () { return this.cache.people.filter(person => !person.isOrganiser && !person.isSpeaker) };
DataStore.prototype.getMe = function () { return this.cache.me };
DataStore.prototype.getOrganisers = function () { return this.cache.people.filter(person => person.isOrganiser) };
DataStore.prototype.getPerson = function (id) { return this.cache.people.filter(person => person.id === id).pop() };
DataStore.prototype.getPeople = function () { return this.cache.people };
DataStore.prototype.getSchedule = function () { return this.cache.schedule.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) };
DataStore.prototype.getSettings = function () { return this.cache.settings };
DataStore.prototype.getSpeakers = function () { return this.cache.people.filter(person => person.isSpeaker) };
DataStore.prototype.getSponsors = function () { return this.cache.sponsors };
DataStore.prototype.getTicketCode = function () { return this.cache.ticketCode };

module.exports = DataStore;
