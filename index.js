const openingTagStr = '<?PJS';
const closingTagStr = '?>';
const fs = require('fs');

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

String.prototype.fillTerminal = function() {
	let dashLength = (process.stdout.columns - this.length) / 2;

	if (dashLength < 0)
		dashLength = 0;

	return '-'.repeat(Math.floor(dashLength)) + this + '-'.repeat(Math.ceil(dashLength));
}



exports.parse = (str, options, filePath) => {
	let prevCodeblockIndex = 0;
	let printStrIndex = 0;
	let parseError;

	options = options || {};

	const debug = {
		log: (...data) => {
			if (options.debug)
				console.log(...data);
		}
	}

	const PJSPrint = (position, codeblockIndex, ...data) => {
		const newStr = data.join('\t');

		if (prevCodeblockIndex != codeblockIndex) {
			prevCodeblockIndex = codeblockIndex;
			printStrIndex = 0;
		}

		str = str.insertAtIndex(position + printStrIndex, newStr);
		printStrIndex += newStr.length;
	}

	debug.log(`\x1b[42m${`Running code in PJS codeblock(s) of ${filePath}`.fillTerminal()}\x1b[0m`);
	str.splitAt(str.allIndexesOf(openingTagStr)).forEach((object, key) => {
		const strIndex = str.indexOf(object.orig);

		// Remove code from orig string
		str = str.replace(object.orig, '');

		// Replace PJS syntax print function with PJS parser function
		object.cut.splitAt(object.cut.allIndexesOf('print('), 'print(', ')').forEach(splitObj => {
			object.cut = object.cut.replace(splitObj.orig, `PJSPrint(${strIndex}, ${key}, ${splitObj.cut})`);
		});

		try {
			eval(object.cut);
			debug.log(`\x1b[43m${`Ran code of codeblock at index ${key + 1}`.fillTerminal()}\x1b[0m`);
		} catch (err) {
			if (!parseError)
				parseError = {
					index: key,
					err: err
				};
			}
		});

	debug.log(`\x1b[100m${`Finished running code for ${filePath}`.fillTerminal()}\x1b[0m`);

	if (parseError) {
		debug.log(`\x1b[41m${'There was an error with parsing'.fillTerminal()}\x1b[0m`);

		return `<div style="font-family: 'Arial', sans-serif"><h1 style="color: red; background-color: rgba(0, 0, 0, 0.8); padding: 5px 0; padding-left: 10px">Error parsing PJS file &#8595;</h1><i style="background-color: darkgray;">Code-block index: ${parseError.index + 1}</i><div style="background-color: lightgray; padding: 10px;">${parseError.err}</div></div>`
	} else return str;
}

module.exports.init = app => {
	app.engine('pjs', (filePath, options, callback) => {
		fs.readFile(filePath, (err, data) => {
			if (err)
				return callback(err);
			else {
				data = data.toString();
				data = exports.parse(data, options, filePath);

				return callback(null, data);
			}
		});
	});

	app.set('view engine', 'pjs');
}