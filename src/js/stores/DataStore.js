var EventEmitter = require('events').EventEmitter;

var async = require('async');
var defaultData = require('./default');
var secret = require('./secret');
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
  this.cache.settings = {
		aboutLogo: './img/thinkmill-logo_white.svg'
	};
  this.cache.starred = {};
	this.cache.speakers = [];
	this.cache.sponsors = [];
	this.cache.organisers = [];
	this.__preprocess(storage);
	this.cache = Object.assign(this.cache, storage);

// 	TODO maybe window.addEventListener('online', this.updateOnlineStatus);
// 	TODO maybe window.addEventListener('offline', this.updateOnlineStatus);

	// generic API queue
	var self = this;
	var url = 'http://api.eventlama.com';
	this.apiQueue = async.queue(function (opts, callback) {
		var { authToken } = storage;
		var { endpoint, data, method } = opts;

		httpify({
			method: method || 'POST',
			url: url + endpoint,
			headers: { 'Content-Type': 'application/json' },
			timeout: 20000
		}, (err, res) => {
			if (err) return callback(err);
			if (res.statusCode !== 200) return callback(new Error('Error ' + res.statusCode));

			var body = res.body || {};

			var data = body || {};
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

	var context = this;
	this.apiQueue.push({
		method: 'GET',
		endpoint: '/checkin/events/28/checkinlists/' + secret.main.id + '/' + secret.main.token
	}, function (err, data) {
		// TODO Proper error handling
		if (!err) {
			context.cache.people = data.attendees;
		}
	});

	// every 30s, attempt synchronize, queues incase it takes a while
	self.synchronize();
	setInterval(function () {
		self.synchronize();
	}, 30000);
}

// mutates data
DataStore.prototype.__preprocess = function (data) {
	if (data.attendees) {
		var starred = this.cache.starred;
		var talks = data.Proposals || this.cache.Proposals;
		data.attendees.forEach(person => {
      // Set properties of attendees
			person.bio = person.bio || '';
			person.github = person.github || '';
			person.picture = person.picture || '';
			person.starred = starred[person.id];
			person.twitter = person.twitter || '';
			person.name = person.purchase.attendee_first_name + ' ' + person.purchase.attendee_last_name;

      // Filter for talks associated with a person
			person.talks = person.talks || talks
				.filter(talk => {
					if (talk.speakers) {
						var isSpeaker = false;
            // Map over the speakers of a talk
						talk.speakers.map((speaker) => {
              // If the email of the speaker is the same as the attendee email, they're giving this talk!
							if (speaker.email === person.purchase.attendee_email) {
								isSpeaker = true;
								person.bio = speaker.bio;
								person.twitter = speaker.twitter;
								person.url = speaker.url;
								person.github = speaker.github;
								person.picture = speaker.avatar_url;
							}
						});
						return isSpeaker;
					}
				});
		});

		this.cache.people = data.attendees;
	}

	if (data.Proposals && this.cache.speakers.length === 0) {
		var feedback = this.cache.feedback;
		var speakers = this.cache.speakers;
    var talks = this.cache.Proposals;
		if (!feedback) {
			feedback = this.cache.feedback = {};
		}

		data.Proposals.forEach(talk => {
			talk.endTime = talk.start_date + talk.length;
			if (!feedback[talk.id]) {
				feedback[talk.id] = {};
			}
			talk.feedback = feedback[talk.id];
			if (talk.speakers) {
				talk.speakers.forEach(speaker => {
          var duplicate = false;
          this.cache.speakers.forEach((cachedSpeaker) => {
            if (cachedSpeaker.email === speaker.email) {
              duplicate = true;
            }
          });
          if (!duplicate) {
            speaker.talks = talks.filter(talk => {
              var isSpeaker = false;
              talk.speakers && talk.speakers.filter((talkSpeaker) => {
                if (speaker.email === talkSpeaker.email) {
                  isSpeaker = true;
                }
              });
              return isSpeaker;
            });
            speakers.push(speaker);
          }
				});
			}
		});
	}

	if (data.Organizer && this.cache.organisers.length === 0) {
		var organisers = this.cache.organisers;
		organisers.push(data.Organizer);
		data.Collaborators.forEach(function (collaborator) {
			organisers.push(collaborator);
		});
		this.cache.organisers = organisers;
	}

	if (data.DiamondSponsors && this.cache.sponsors.length === 0) {
		var sponsors = this.cache.sponsors;
		if (data.DiamondSponsors) {
			data.DiamondSponsors.map(sponsor => {
				sponsor.tier = 'diamond';
				sponsors.push(sponsor);
			});
		}
		if (data.PlatinumSponsors) {
			data.PlatinumSponsors.map(sponsor => {
				sponsor.tier = 'platinum';
				sponsors.push(sponsor);
			});
		}
		if (data.GoldSponsors) {
			data.GoldSponsors.map(sponsor => {
				sponsor.tier = 'gold';
				sponsors.push(sponsor);
			});
		}
		if (data.BronzeSponsors) {
			data.BronzeSponsors.map(sponsor => {
				sponsor.tier = 'bronze';
				sponsors.push(sponsor);
			});
		}
		if (data.BasicSponsors) {
			data.BasicSponsors.map(sponsor => {
				sponsor.tier = 'basic';
				sponsors.push(sponsor);
			});
		}
		if (data.PartnersSponsors) {
			data.PartnersSponsors.map(sponsor => {
				sponsor.tier = 'partner';
				sponsors.push(sponsor);
			});
		}
		this.cache.sponsors = sponsors;
	}
};

Object.assign(DataStore.prototype, EventEmitter.prototype);

// Synchronized, external API functions
DataStore.prototype.activate = function (ticketCode, callback) {
	this.cache.ticketCode = ticketCode;
	var context = this;

	this.apiQueue.push({
		method: 'GET',
		endpoint: '/checkin/events/28/checkinlists/' + secret.main.id + '/' + secret.main.token + '/attendee/' + ticketCode
	}, function (err, data) {
		if (err) return callback(err);
		context.cache.me = data;
		context.cache.me.twitter = data.Questions[1].answer;
		context.cache.me.bio = data.Questions[3].answer;
		callback();
	});
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
	var context = this;
	this.apiQueue.push({
		method: 'GET',
		endpoint: '/data/reacteurope-2016/all.json'
	}, function (err, data) {
	});
};

// Unsynchronized, non external API functions
DataStore.prototype.star = function (id, starred) {
	this.cache.starred[id] = starred;
	var foundStarredPerson = false;

	// update people cache
	this.cache.speakers.forEach(function (person) {
		if (person.id !== id || foundStarredPerson) return;
		foundStarredPerson = true;
		person.starred = starred;
	});

	if (!foundStarredPerson) {
		this.cache.organisers.forEach(function (person) {
			if (person.id !== id || foundStarredPerson) return;
			foundStarredPerson = true;
			person.starred = starred;
		});
	}

	window.localStorage.starred = JSON.stringify(this.cache.starred);
};

DataStore.prototype.amRegistered = function () { return !!this.cache.me };
DataStore.prototype.getAttendees = function () { return [] };
DataStore.prototype.getMe = function () { return this.cache.me };
DataStore.prototype.getOrganisers = function () { return this.cache.organisers };
DataStore.prototype.getPerson = function (id) { return this.cache.speakers.filter(person => person.id === id).pop() };
DataStore.prototype.getPeople = function () { return this.cache.people };
DataStore.prototype.getSchedule = function () { return this.cache.Proposals.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)) };
DataStore.prototype.getSettings = function () { return this.cache.settings };
DataStore.prototype.getSpeakers = function () { return this.cache.speakers };
DataStore.prototype.getSponsors = function () { return this.cache.sponsors };
DataStore.prototype.getTicketCode = function () { return this.cache.ticketCode };

module.exports = DataStore;
