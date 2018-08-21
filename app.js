const express = require('express');
const app = express();

const exphbs = require('express-handlebars');
const giphy = require('giphy-api')();

const maxGifs = 25;
const highlights = 14;

const home = 'home';
const favs = 'favorites';
const search = 'search';
const monthNames = [
    'January ', 'February ', 'March ',
    'April ', 'May ', 'June ', 'July ',
    'August ', 'September ', 'October ',
    'November ', 'December '
];

const dataJSON = require(__dirname + '/data.json');
const parsedData = JSON.parse(JSON.stringify(dataJSON));

const categories = parsedData['categories'];
const dances = parsedData['dances'];
const phrases = parsedData['phrases'];

const envJSON = require(__dirname + '/environment.json');
const parsedEnv = JSON.parse(JSON.stringify(envJSON));

const fireconfig = parsedEnv['fireconfig'];

const firebase = require('firebase');
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

var highlight = 0;

var lastFocused = null;
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

const serveFavs = function (page) {
    var served = [];
    var offset = page * maxGifs;

    for (var i = offset; i < offset + maxGifs; i++) {
        if (favorites[i] !== undefined) {
            served.push(favorites[i]);
        } else {
            break;
        }
    }

    return served;
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

const canGo = function (page, pagination = null) {
    var navi = {
        forward: false,
        back: page > 0 ? true : false
    }

    if (pagination !== null) {
        navi.forward = pagination.total_count > page * maxGifs + maxGifs;
    } else {
        navi.forward = favorites.length > page * maxGifs + maxGifs;
    }

    return navi;
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
    lastPage.focused = focused ? true : false;
    lastFocused = focused;
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

const renderHome = function (res) {
    updateCurPage(home, null);

    highlight = Math.floor(Math.random() * highlights);

    res.render('home', {
        catList: categories,
        highlight: highlight,
        randDance: getRand(dances),
        randPhrase: getRand(phrases),
        navAnimState: getAnimState('nav'),
        homeAnimState: getAnimState('home'),
        focusAnimState: 'hidden'
    });
    updateLastPage(home, null);
}

const renderResults = function (target, res, data) {
    updateCurPage(target, data.focused);

    data.navAnimState = getAnimState('nav');
    data.focusAnimState = getAnimState('focus');
    res.render('result', data);

    updateLastPage(target, data.focused);
}

app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {
        json: function (obj) {
            return obj ? JSON.stringify(obj).replace(/"/g, "'") : 'no object';
        },
        getConfig: function (key) {
            switch (key) {
                case 'apikey':
                    return fireconfig.apiKey;

                case 'msgid':
                    return fireconfig.messagingSenderId;

                default:
                    return 'error';
            }
        },
        stringify: function (val) {
            return val ? val.replace(' GIF', '') : 'N/A';
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
        isFocused: function (gif) {
            return gif ? true : false;
        },
        scrollTitle: function (gif) {
            var title = gif.title.replace(' GIF', '');
            var width = gif.images.fixed_height.width;

            return (title.length > (width / 10) + 2) ? ' scroll' : '';
        },
        disabled: function (bool) {
            return bool ? '' : ' disabled';
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
    renderHome(res);
});

app.get('/favorites', function (req, res) {
    updateFavs().then(() => {
        var page = req.query.page ? req.query.page : 0;
        var focusID = req.query.focus ? req.query.focus : null;

        var gifs = serveFavs(page);

        var data = {
            gifs: gifs,
            nextPageGifs: [],
            favIDs: favIDs,
            focused: focusID ? getFocused(gifs, focusID) : null,
            lastFocused: lastFocused,
            curPage: page,
            navigation: canGo(page),
            catList: categories,
            highlight: highlight,
            navAnimState: null,
            focusAnimState: null
        };

        if (data.navigation.forward) {
            data.nextPageGifs = serveFavs(parseInt(page) + 1);
        }

        renderResults(favs, res, data);
    }).catch((error) => {
        console.error(error);
    });
});

app.get('/search', function (req, res) {
    updateFavs().then(() => {
        var input = req.query.term ? req.query.term : null;
        var page = req.query.page ? req.query.page : 0;
        var focusID = req.query.focus ? req.query.focus : null;

        var data = {
            gifs: null,
            nextPageGifs: [],
            favIDs: favIDs,
            focused: null,
            lastFocused: lastFocused,
            curPage: page,
            navigation: null,
            catList: categories,
            highlight: highlight,
            navAnimState: null,
            focusAnimState: null
        };


        if (input !== null) {
            giphy.search({
                q: input,
                limit: maxGifs,
                offset: page * maxGifs
            }, (error, response) => {
                data.gifs = response.data;
                data.focused = focusID ? getFocused(data.gifs, focusID) : null;
                data.navigation = canGo(page, response.pagination);

                if (error !== null) {
                    console.error(error);
                }

                if (data.navigation.forward) {
                    giphy.search({
                        q: input,
                        limit: maxGifs,
                        offset: (parseInt(page) + 1) * maxGifs
                    }, (error, response) => {
                        data.nextPageGifs = response.data;

                        renderResults(search, res, data)
                    });
                } else {
                    renderResults(search, res, data);
                }
            });
        } else {
            renderHome(res);
        }
    }).catch((error) => {
        console.error(error);
    });
});