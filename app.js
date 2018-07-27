var express = require('express');
var app = express();

var exphbs = require('express-handlebars');

var giphy = require('giphy-api')();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.listen(3000, function () {
    console.log('Gif Search listening on port localhost:3000!');
});

app.get('/', function (req, res) {
    giphy.search(req.query.term, function (err, response) {
        var giphyRes = response ? response : { data: null };

        res.render('home', { gifs: giphyRes.data })
    });
});

app.get('/hello-gif', function (req, res) {
    var gifUrl = 'http://media2.giphy.com/media/gYBVM1igrlzH2/giphy.gif';
    res.render('hello-gif', { gifUrl: gifUrl })
});

app.get('/hello-world', function (req, res) {
    res.send('Hello World');
});

app.get('/greetings/:name', function (req, res) {
    var name = req.params.name;
    res.render('greetings', { name: name });
});