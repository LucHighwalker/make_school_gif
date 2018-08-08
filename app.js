const express = require('express');
const app = express();

const exphbs = require('express-handlebars');
const giphy = require('giphy-api')();

const home = 'home';
const favs = 'favorites';
const search = 'search';
const monthNames = [
    'January ', 'February ', 'March ',
    'April ', 'May ', 'June ', 'July ',
    'August ', 'September ', 'October ',
    'November ', 'December '
];

const dataJSON = require(__dirname + '/public/JSON/data.json');
const parsedData = JSON.parse(JSON,stringify(dataJSON));

const categories = parsedData['categories'];
const dances = parsedData['dances'];
const phrases = parsedData['phrases'];

const firebase = require('firebase');

const fireconfig = {
    apiKey: "AIzaSyAKnz2r0PBnstYUZSMvNUtJ3JP3ZqpLytw",
    authDomain: "notjif.firebaseapp.com",
    databaseURL: "https://notjif.firebaseio.com",
    projectId: "notjif",
    storageBucket: "notjif.appspot.com",
    messagingSenderId: "390698485567"
};
firebase.initializeApp(fireconfig);

const firestore = firebase.firestore();
const storeSettings = { timestampsInSnapshots: true };
firestore.settings(storeSettings);

var curPage = {
    page: null,
    focused: false
}
var lastPage = {
    page: null,
    focused: false
}

var favorites = [];
var favIDs = [];

const updateFavs = function () {
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

const getFocused = function (gifs, focused) {
    var focusedGif = null;
    for (var i = 0; i < gifs.length; i++) {
        if (focused === gifs[i].id) {
            focusedGif = gifs[i];
            break;
        }
    }
    return focusedGif;
}

const getRand = function (array) {
    var rand = Math.floor(Math.random() * array.length);
    return array[rand];
}

const updateCurPage = function (page, focused) {
    curPage.page = page;
    curPage.focused = focused !== null ? true : false;
}

const updateLastPage = function (page, focused) {
    lastPage.page = page;
    lastPage.focused = focused !== null ? true : false;
}

const getAnimState = function (key) {
    switch (key) {
        case 'nav':
            if (curPage.page === home && lastPage.page === home) {
                return 'hidden';
            } else if (curPage.page === home && lastPage.page !== home) {
                return 'hide';
            } else if (curPage.page !== home && lastPage.page === home) {
                return 'show';
            } else if (curPage.page !== home && lastPage.page !== home) {
                return 'shown';
            } else {
                console.error('error getting nav anim state going from page (' +
                    lastPage.page + ') to page (' + curPage.page + ')');
                return 'error';
            }

        case 'home':
            if (curPage.page === home && lastPage.page === home) {
                return 'shown';
            } else {
                return 'show';
            }

        case 'focus':
            if (curPage.focused === true && lastPage.focused === true) {
                return 'shown';
            } else if (curPage.focused === true && lastPage.focused === false) {
                return 'show';
            } else if (curPage.focused === false && lastPage.focused === true) {
                return 'hide';
            } else if (curPage.focused === false && lastPage.focused === false) {
                return 'hidden';
            } else {
                console.error('error getting focus anim state going from focus state (' +
                    lastPage.focused + ') to focus state (' + curPage.focused + ')');
                return 'error';
            }

        default:
            console.error('invalid key getting anim state.');
            return 'error';
    }
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
        stringify: function (val) {
            return val ? val : 'N/A';
        },
        formatDate: function (dateString) {
            if (dateString !== undefined) {
                var date = new Date(dateString);
                var month = date.getMonth();
                var day = date.getDate();
                var year = date.getFullYear();

                var dayExt = ' ';
                switch (day) {
                    case 1:
                    case 21:
                    case 31:
                        dayExt = 'st ';
                        break;

                    case 2:
                    case 22:
                        dayExt = 'nd ';
                        break;

                    case 3:
                    case 23:
                        dayExt = 'rd ';
                        break;

                    default:
                        dayExt = 'th ';
                        break;
                }

                return monthNames[month] + day + dayExt + year;
            } else {
                return 'N/A';
            }
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
    updateCurPage(home, null);
    res.render('home', {
        catList: categories,
        randDance: getRand(dances),
        randPhrase: getRand(phrases),
        navAnimState: getAnimState('nav'),
        homeAnimState: getAnimState('home')
    });
    updateLastPage(home, null);
});

app.get('/favorites', function (req, res) {
    updateFavs().then(() => {
        var page = req.query.page ? req.query.page : 0;
        var focusID = req.query.focus ? req.query.focus : null;
        var focused = focusID ? getFocused(favorites, focusID) : null;

        updateCurPage(favs, focused);
        res.render('result', {
            gifs: favorites,
            favIDs: favIDs,
            focused: focused,
            curPage: page,
            catList: categories,
            navAnimState: getAnimState('nav'),
            focusAnimState: getAnimState('focus')
        });
        updateLastPage(favs, focused);
    }).catch((error) => {
        console.error(error);
    });
});

app.get('/search', function (req, res) {
    updateFavs().then(() => {
        var input = req.query.term ? req.query.term : ' ';
        var page = req.query.page ? req.query.page : 0;
        var focusID = req.query.focus ? req.query.focus : null;

        giphy.search({
            q: input,
            limit: 25,
            offset: page * 25
        }, function (error, response) {
            var gifs = response.data;
            var focused = focusID ? getFocused(gifs, focusID) : null;

            updateCurPage(search, focused);
            res.render('result', {
                gifs: gifs,
                favIDs: favIDs,
                focused: focused,
                curPage: page,
                catList: categories,
                navAnimState: getAnimState('nav'),
                focusAnimState: getAnimState('focus')
            });
            updateLastPage(search, focused);

            if (error !== null) {
                console.error(error);
            }
        });
    }).catch((error) => {
        console.error(error);
    });
});