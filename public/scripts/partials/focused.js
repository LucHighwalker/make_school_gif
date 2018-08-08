var unfocusing = false;

const unfocusGif = function (gifID) {
    if (unfocusing === false) {
        unfocusing = true;
        var curURL = window.location.href;
        var focusParam = $.param({ focus: gifID });
        var paramIndex = curURL.indexOf(focusParam);

        var remove = curURL.slice(paramIndex - 1, curURL.length);
        var newURL = curURL.replace(remove, '');

        history.pushState(null, null, newURL);
        window.location.reload();
    }
}