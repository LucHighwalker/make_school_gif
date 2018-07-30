var express = require('express');
var app = express();

var exphbs = require('express-handlebars');
var giphy = require('giphy-api')();

var catJSON = require(__dirname + '/public/JSON/categories.json');
var categories = JSON.parse(JSON.stringify(catJSON));

app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.listen(4200, function () {
    console.log('notJif listening on port localhost:4200!');
});

app.get('/', function (req, res) {
    res.render('home', { catList: categories });
});

app.get('/search', function (req, res) {
    var input = req.query.term ? req.query.term : ' ';

    giphy.search(input, function (err, response) {
        res.render('result', { gifs: response.data, catList: categories });

        if (err !== null) {
            console.error(err);
        }
    });
});