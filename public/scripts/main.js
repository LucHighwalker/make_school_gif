window.addEventListener('popstate', () => {
    window.location.reload();
}, false);

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