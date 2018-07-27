var express = require('express');
var app = express();

var exphbs = require('express-handlebars');
var giphy = require('giphy-api')();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.listen(4200, function () {
    console.log('Gif Search listening on port localhost:4200!');
});

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/search', function (req, res) {
    var input = req.query.term ? req.query.term : ' ';

    giphy.search(input, function (err, response) {
        res.render('search', { gifs: response.data });

        if (err !== null) {
            console.error(err);
        }
    });
});