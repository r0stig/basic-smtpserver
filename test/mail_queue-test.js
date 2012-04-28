var mq = require('../lib/mail_queue.js')
	//, assert = require('assert')
	;

exports["Mail_queue-test"] = {
	setUp: function(callback) {
		this.queue = new mq.queue();
		callback();
	},
	tearDown: function(callback) {
	
		callback();
	},
	test1: function(test) {
		test.expect(2);
		
		var message = {
			mail_from: '<pr_125@hotmail.com>',
			rcpt_to: '<pr_125@hotmail.com>',
			data: 'This is some data \r\n.\r\n'
		};
		this.queue.insert(message);
		
		var same_message = this.queue.get_next_in_line();
		
		test.equal(message.mail_from, same_message.mail_from, "Mail_from equal");
		test.ok( this.queue.count() === 0, "One item in the queue" + this.queue.count() + " === 1");
		test.done();
	}

};