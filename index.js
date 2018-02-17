const {server} = require('../serverModule.js');
const fs = require('fs');

const fileName = './index.pjs';
const openingTagStr = '<?PJS';
const closingTagStr = '?>';

String.prototype.insertAtIndex = function(index, substr) {
	return [this.slice(0, index), substr, this.slice(index)].join('');
}

String.prototype.allIndexesOf = function(substr) {
	let pos = this.indexOf(substr);
	const indexes = [];

	while (pos > -1) {
		indexes.push(pos);
		pos = this.indexOf(substr, pos + 1);
	}

	return indexes;
}

String.prototype.splitAt = function(indexes, openingStr, closeStr) {
	const substrings = [];

	closeStr = closeStr || closingTagStr;
	openingStr = openingStr || openingTagStr;
	for (let i = 0; i < indexes.length; i++) {
		const strPart = this.substr(indexes[i], indexes[i + 1]);
		const endPos = strPart.indexOf(closeStr);

		if (endPos) {
			substrings.push({
				cut: strPart.substr(openingStr.length, endPos - openingStr.length),
				orig: strPart.substr(0, endPos + closeStr.length)
			});
		} else {
			throw new Error('No closing tag found!');
		}
	}

	return substrings;
}

function parsePJS(str) {
	let prevCodeblockIndex = 0;
	let printStrIndex = 0;
	let parseError;

	const PJSPrint = (position, codeblockIndex, ...data) => {
		const newStr = data.join('\t');

		if (prevCodeblockIndex != codeblockIndex) {
			prevCodeblockIndex = codeblockIndex;
			printStrIndex = 0;
		}

		str = str.insertAtIndex(position + printStrIndex, newStr);
		printStrIndex += newStr.length;
	}

	str.splitAt(str.allIndexesOf(openingTagStr)).forEach((object, key) => {
		const strIndex = str.indexOf(object.orig);

		// Remove code from orig string
		str = str.replace(object.orig, '');

		// Replace PJS syntax print function with PJS parser function
		object.cut.splitAt(object.cut.allIndexesOf('print('), 'print(', ')').forEach(splitObj => {
			object.cut = object.cut.replace(splitObj.orig, `PJSPrint(${strIndex}, ${key}, ${splitObj.cut})`);
		});

		console.log(`\x1b[42mRunning code of PJS codeblock of index ${key} in ${fileName}\x1b[0m`);

		try {
			eval(object.cut);
		} catch (err) {
			if (!parseError)
				parseError = {
					index: key,
					err: err
				};
			}
		});

	if (parseError)
		return `<div style="font-family: 'Arial', sans-serif"><h1 style="color: red; background-color: rgba(0, 0, 0, 0.8); padding: 5px 0; padding-left: 10px">Error parsing PJS file &#8595;</h1><i style="background-color: darkgray;">Code-block index: ${parseError.index + 1}</i><div style="background-color: lightgray; padding: 10px;">${parseError.err}</div></div>`
	else
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