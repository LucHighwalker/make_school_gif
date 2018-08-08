var focusing = false;

const focusGif = function (gifID) {
    if (focusing === false) {
        focusing = true;
        var curURL = window.location.href;
        var joinSymbol = '?';

        if (curURL.includes('?')) {
            joinSymbol = '&';
        }

        history.pushState(null, null, curURL + joinSymbol + $.param({ focus: gifID }));
        window.location.reload();
    }
}

const changePage = function (curPage, mod) {
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

const prevPage = function (curPage) {
    changePage(curPage, -1);
}

const nextPage = function (curPage) {
    changePage(curPage, 1);
}