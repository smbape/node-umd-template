module.exports = waitRender;

function waitRender() {
    var callback = arguments[arguments.length - 1];
    // document.addEventListener('render', onRender);
    iterate();

    // addEventListener doesn't work with firefox
    // almost like document/window is not the same
    function iterate() {
        if (!window.rendered) {
            setTimeout(iterate, 100);
            return;
        }

        onRender();
    }

    function onRender() {
        // document.removeEventListener('render', onRender);
        callback();
    }
}