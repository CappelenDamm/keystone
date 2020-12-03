var keystone = require('../../index.js');
var mongooseConnection = require('./getMongooseConnection.js');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');

async function getExpressApp() {
	var app;
	keystone.init({
		'mongoose': await mongooseConnection
	});
	app = keystone.express();

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(methodOverride());

	return app;
}

module.exports = getExpressApp;
