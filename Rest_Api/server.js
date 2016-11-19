var express		= require('express');
var mongoose	= require('mongoose');
var bodyParser	= require('body-parser');
var passport	= require('passport');
var	ejs			= require('ejs');
var session		= require('express-session');
var cors		= require('cors');

var userController 	= require('./controllers/user.js');
var	AuthController	= require('./controllers/auth.js');
var Config			= require('./config/database.js');

var app 		= express();
var port 		= process.env.PORT || 3001;
var router		= express.Router();

mongoose.connect('mongodb://localhost:27017/hyperDB');

var corsOptions = {
	origin: 'http://localhost:3000'
};
var issuesOptions = {
	origin: true,
	methods: [ 'POST', 'PUT' ],
	credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(issuesOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(passport.initialize());
require('./controllers/passport.js')(passport);

app.use(session({
  	secret: Config.secret,
  	saveUninitialized: true,
  	resave: true
}));

router.get('/', (req, res) => {
	res.json({ message: 'Salutations from the REST Api!' });
});

router.route('/users')
	.post(userController.postUser);

router.route('/authenticate')
	.post(AuthController.authenticate);
router.route('/exchange42')
	.post(AuthController.authenticate42);
router.route('/auth_token', function (req, res) {
	console.log('\n\nROUTE\n\n')
	console.log(req);
});

app.use('/api', router);
app.listen(port);
console.log('Listening on Port: ' + port);