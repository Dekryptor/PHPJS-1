const {server} = require('../serverModule.js');
const fs = require('fs');

const regExpG = /<\?PJS(\n)?(.+)(\n)?\?>/igm;
const regExp = /<\?PJS(\n)?(.+)(\n)?\?>/i;
const fileName = './index.pjs';

String.prototype.insertAtIndex = function(index, substr) {
	return [this.slice(0, index), substr, this.slice(index)].join('');
}

function parsePJS(str) {
	const matches = str.match(regExpG);

	const PJSPrint = (index, ...data) => {
		str = str.insertAtIndex(index, data.join('\t'));
	}

	if (matches) {
		matches.forEach((object, key) => {
			const strIndex = str.indexOf(object);
			const match = object.match(regExp);

			// Remove code from orig string
			str = str.replace(object, '');

			if (match) {
				const codeStr = match[2].trim().split(/(\n|;)/).reverse().map(object => {
					return object.replace(/print\((.+)\)/, `PJSPrint(${strIndex}, $1)`);
				}).join('');

				console.log(`\x1b[42mRunning code of PJS codeblock of index ${key} in ${fileName}\x1b[0m`);

				eval(codeStr);
			}
		});
	}

	return str;
}

function sendErr(response) {
	response.status(500).send('Webpage not available');
}

server.get('*', (request, response) => {
	if (fileName.toLowerCase().endsWith('.pjs')) {
		fs.readFile(fileName, (err, data) => {
			if (err)
				sendErr(response);
			else {
				data = data.toString();
				data = parsePJS(data);

				response.header({
					'Content-Length': Buffer.byteLength(data),
					'Content-Type': 'text/html'
				}).send(data);
			}
		});
	} else response.sendFile(fileName);
});