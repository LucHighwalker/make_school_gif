var findIndex = function (array, obj) {
    var index = -1;
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === obj.id){
            index = i;
            break;
        }
    }
    return index;
}

var focusGif = function (gifID) {
    var curURL = window.location.href;
    var joinSymbol = '?';

    if (curURL.includes('?')) {
        joinSymbol = '&';
    }

    history.pushState(null, null, curURL + joinSymbol + $.param({focus: gifID}));
    window.location.reload();
}

var toggleFavorite = function (gif) {
    var docRef = firestore.collection('users').doc('testuser');

    docRef.get().then((doc) => {
        var data = doc.data();
        var favs = data.favorites;

        var exists = findIndex(favs, gif);

        if (exists >= 0) {
            favs.splice(exists, 1);
        } else {
            favs.push(gif);
        }

        data.favorites = favs;

        docRef.set(data).then(() => {
            console.log('updated favorites');
            location.reload();
        }).catch((error) => {
            console.error('error updating favorites: ' + error);
        });
    }).catch((error) => {
        console.error('error retrieving user document: ' + error);
    });
}