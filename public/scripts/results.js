const swipeDiff = 20;

document.addEventListener('touchstart', touchStart, false);
document.addEventListener('touchmove', touchMove, false);

var focusing = false;
var touchDown = null;

const changePage = function (mod) {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    
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

function touchStart(event) {
    touchDown = event.touches[0].clientX;
};

function touchMove(event) {
    if (!touchDown || isFocused) {
        return;
    }

    var touchUp = event.touches[0].clientX;
    var diff = touchDown - touchUp;

    if (nextPageAvail && diff > swipeDiff) {
        changePage(1);
    } else if (prevPageAvail && diff < -swipeDiff) {
        changePage(-1);
    }

    touchDown = null;
};