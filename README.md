# PHPJS
JavaScript variant of PHP

*Run the index.js for a demonstation!*

### Why?
I liked that with PHP you could add server-side code to a file, but was far more familiar with JavaScript and I wanted to use it server-side, client-size and in files.

### How do I use it?
**Still in early development.**
You create a file with the *.pjs* extention and run the *parsePJS* with the contents of that file ([See example](https://github.com/Jantje19/PHPJS/blob/master/index.js)). Everything between the opening (```<?PJS```) and the closing (```?>```) PJS tags will be run as normal JS code on the server.

### Notes
- **The print function in asynchronous functions is not supported.** Synchronous functions **are** supported, so ```fs.readdirSync``` for example **is** supported.
- Run with ```--debug``` flag for debug information.