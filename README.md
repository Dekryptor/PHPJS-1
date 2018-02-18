# PHPJS
JavaScript variant of PHP

*Run the index.js for a demonstration!*

### Why?
I liked that with PHP you could add server-side code to a file, but was far more familiar with JavaScript and I wanted to use it server-side, client-size and in files.

### How do I use it?
**Still in early development.**
Take a look at the examples first.

In your project with Express you can use PJS as an templating engine. You need to run the ```init``` function with the Express *app* as the first argument. This will setup the automatic parsing of any response that gets send with a *.pjs* extension.
If you don't use Express you can still use it by running the ```parse``` function with the contents of the file you want to parse.
Everything between the opening (```<?PJS```) and the closing (```?>```) PJS tags in these files will be run as JavaScript code on the server.

### Notes
- **The print function in asynchronous functions is not supported.** Synchronous functions **are** supported, so ```fs.readdirSync``` for example **is** supported.