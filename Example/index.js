const express = require('express');
const PJS = require('../index.js');

const app = express();

// Init PJS
PJS.init(app);

app.get('*', (request, response) => {
	response.render(__dirname + '/index.pjs');
});

app.listen(8000, err => {
	if (err)
		console.log('An error occured with setting up the server:', err);
	else
		console.log('Server running on port 8000');
});