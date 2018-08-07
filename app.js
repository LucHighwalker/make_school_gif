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

var favorites = [];
var favIDs = [];
var updateFavs = function () {
    return new Promise((resolve, reject) => {
        favorites = [];
        favIDs = [];
        var docRef = firestore.collection('users').doc('testuser');

        docRef.get().then((doc) => {
            var data = doc.data();
            favorites = data.favorites;
            for (var i = 0; i < favorites.length; i++) {
                favIDs.push(favorites[i].id);
            }
            resolve('success');
        }).catch((error) => {
            console.error('error loading favorites: ');
            reject(error)
        });
    });
}

// Possible to move to client?
var getFocused = function (gifs, focused) {
    var focusedGif = null;
    for (var i = 0; i < gifs.length; i++) {
        if (focused === gifs[i].id) {
            focusedGif = gifs[i];
            break;
        }
    }
    return focusedGif;
}

app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {
        json: function (obj) {
            return JSON.stringify(obj).replace(/"/g, "'");
        },
        scrollTitle: function (gif) {
            var title = gif.title;
            var width = gif.images.fixed_height.width;
            
            return (title.length > (width / 10) + 2) ? ' scroll' : '';
        },
        favorited: function (gifID) {
            var favorite = false;
            for (var i = 0; i < favIDs.length; i++) {
                if (gifID === favIDs[i]) {
                    favorite = true;
                    break;
                }
            }
            return favorite ? ' favorited' : '';
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
    updateFavs().then(() => {
        var page = req.query.page ? req.query.page : 0;
        var focusID = req.query.focus ? req.query.focus: null;
        var focused = focusID ? getFocused(favorites, focusID) : null;

        res.render('result', {
            gifs: favorites,
            favIDs: favIDs,
            focused: focused,
            curPage: page,
            reloadChange: true,
            navSearch: true,
            catList: categories
        });
    }).catch((error) => {
        console.error(error);
    });
});

app.get('/search', function (req, res) {
    updateFavs().then(() => {
        var input = req.query.term ? req.query.term : ' ';
        var page = req.query.page ? req.query.page : 0;
        var focusID = req.query.focus ? req.query.focus: null;

        giphy.search({
            q: input,
            limit: 25,
            offset: page * 25
        }, function (error, response) {
            var gifs = response.data;
            var focused = focusID ? getFocused(gifs, focusID) : null;

            res.render('result', {
                gifs: gifs,
                favIDs: favIDs,
                focused: focused,
                curPage: page,
                reloadChange: false,
                navSearch: true,
                catList: categories
            });

            if (error !== null) {
                console.error(error);
            }
        });
    }).catch((error) => {
        console.error(error);
    });
});