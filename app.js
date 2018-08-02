var express = require('express');
var app = express();

var exphbs = require('express-handlebars');
var giphy = require('giphy-api')();

var catJSON = require(__dirname + '/public/JSON/categories.json');
var categories = JSON.parse(JSON.stringify(catJSON));

var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyAKnz2r0PBnstYUZSMvNUtJ3JP3ZqpLytw",
    authDomain: "notjif.firebaseapp.com",
    databaseURL: "https://notjif.firebaseio.com",
    projectId: "notjif",
    storageBucket: "notjif.appspot.com",
    messagingSenderId: "390698485567"
};
firebase.initializeApp(config);

var firestore = firebase.firestore();
var storeSettings = { timestampsInSnapshots: true };
firestore.settings(storeSettings);

var updateFavorites = function () {
    
}

app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {
        json: function (context) {
            return JSON.stringify(context).replace(/"/g, "'");
        }
    }
}));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.listen(4200, function () {
    console.log('notJif listening on port localhost:4200!');
});

app.get('/', function (req, res) {
    res.render('home', {
        navSearch: false,
        catList: categories
    });
});

app.get('/favorites', function (req, res) {
    var docRef = firestore.collection('users').doc('testuser');

    docRef.get().then((doc) => {
        var data = doc.data();

        res.render('result', {
            gifs: data.favorites,
            reloadChange: true,
            navSearch: true,
            catList: categories
        });
    }).catch((error) => {
        console.error('error loading favorites: ' + error);
    });
});

app.get('/search', function (req, res) {
    var input = req.query.term ? req.query.term : ' ';

    giphy.search(input, function (err, response) {
        res.render('result', {
            gifs: response.data,
            reloadChange: false,
            navSearch: true,
            catList: categories
        });

        if (err !== null) {
            console.error(err);
        }
    });
});