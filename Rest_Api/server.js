var express		= require('express');
var mongoose	= require('mongoose');
var bodyParser	= require('body-parser');
var passport	= require('passport');
var	ejs			= require('ejs');
var session		= require('express-session');
var cors		= require('cors');
var busbuy		= require('connect-busboy');

var apiAuthController 		= require('./controllers/api.auth.js');
var userController 			= require('./controllers/user.js');
var	AuthController			= require('./controllers/auth.js');
var MovieController			= require('./controllers/showMovie.js');
var CommentController 		= require('./controllers/comment.js');
var ResetPasswordController = require('./controllers/passwordReset.js');
var Config					= require('./config/database.js');

var app 		= express();
var port 		= process.env.PORT || 3001;
var router		= express.Router();

mongoose.connect('mongodb://localhost:27017/hyperDB');

var corsOptions = {
	origin: 'http://localhost:3000'
};
var issuesOptions = {
	origin: true,
	methods: [ 'POST', 'PUT', 'GET' ],
	credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(issuesOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(busbuy());

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

/*Adds a new User. Unprotected.*/
router.route('/users')
	.post(userController.postUser);

/*Local User Authentication. Unprotected. Returns Access Token*/
router.route('/authenticate')
	.post(AuthController.authenticate);
/*Exchanges 42 tmp token for access token. Unprotected. Returns Access Token*/
router.route('/exchange42')
	.post(AuthController.authenticate42);
router.route('/authenticateFacebook')
	.post(AuthController.authenticateFacebook);
router.route('/delete_token/:uid')
	.delete(AuthController.deleteToken);

/*Create Endpoint for getting user information, updating as well. Protected.*/
router.route('/user')
	.get(apiAuthController.isAuthenticated, userController.getUser)
	.put(apiAuthController.isAuthenticated, userController.putUser);
/*Endpoints for forgot and reset password. Unprotected.*/
router.route('/forgot')
	.post(ResetPasswordController.postForgot);
router.route('/reset')
	.post(ResetPasswordController.postReset);
/*Endpoint for getting a user profile. Protected.*/
router.route('/user/:usrn')
	.get(apiAuthController.isAuthenticated, userController.getUserProfile);

/*Create Endpoints for managing the user profile picture. Protected.*/
router.route('/upload_image')
	.post(apiAuthController.isAuthenticated, userController.putUserImage);

/*Create Endpoints for managing movie comments. Protected.*/
router.route('/comments/:movieId')
	.post(apiAuthController.isAuthenticated, CommentController.postComments)
	.get(apiAuthController.isAuthenticated, CommentController.getComments);

router.route('/viewed/:mid')
	.post(apiAuthController.isAuthenticated, userController.postViews)
	.get(apiAuthController.isAuthenticated, userController.getViewed);

/*Get the image of the user. Unprotected.*/
router.route('/user_images/:user_image')
	.get(userController.getUserImage);

/*Get the Movie and stream it to the client. Unprotected.*/
router.route('/show_movie/:mid/:quality')
	.get(MovieController.getMovie);

/*Get the Movie Subtitles and stream  it to the client*/
router.route('/movie_subtitles/:mid/:lang')
	.get(MovieController.getMovieSubs);
router.route('/subtitles/:lang/:mid')
	.get(MovieController.getSubtitle);

app.use('/api', router);
app.listen(port);
console.log('Listening on Port: ' + port);