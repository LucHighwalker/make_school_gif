var findIndex = function (array, obj) {
    var index = -1;
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === obj.id) {
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

    history.pushState(null, null, curURL + joinSymbol + $.param({ focus: gifID }));
    window.location.reload();
}

var changePage = function (curPage, mod) {
    var curURL = window.location.href;
    var newURL = '';
    var pageParam = $.param({ page: null });
    var nextPage = curPage + mod > 0 ? curPage + mod : 0;

    if (nextPage !== curPage) {
        if (curURL.includes(pageParam)) {
            newURL = curURL.replace(pageParam + curPage, pageParam + nextPage);
        } else {
            var joinSymbol = '?';

            if (curURL.includes('?')) {
                joinSymbol = '&';
            }

            newURL = curURL + joinSymbol + pageParam + nextPage;
        }

        history.pushState(null, null, newURL);
        window.location.reload();
    }
}

var prevPage = function (curPage) {
    changePage(curPage, -1);
}

var nextPage = function (curPage) {
    changePage(curPage, 1);
}