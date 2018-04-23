const express = require('express');
const PJS = require('../index.js');

const app = express();

// Init PJS
PJS.init(app, {
	debug: false,
	throwErrors: false,
	displayErrors: true
});

app.get('*', (request, response) => {
	response.render(__dirname + '/index.pjs', {
		test: 'This " works',
		func: str => {
			// Print function is not supported in these functions
			// You can, however, return a value and print it in the .pjs file

			console.log(str);
		}
	});
});

app.listen(8000, err => {
	if (err)
		console.log('An error occured with setting up the server:', err);
	else
		console.log('Server running on port 8000');
});