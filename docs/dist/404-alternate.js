"use strict";
document.body.style.overflow = 'hidden';
document.title = window.location.pathname.slice(1).split('/').pop().replace('-', ' ');
(() => {
    const frame = document.createElement('iframe');
    frame.src = 'https://bulmenisaurus.github.io/rickroll.html';
    frame.style.position = 'absolute';
    frame.style.height = '100vh';
    frame.style.width = '100vw';
    frame.title = 'rickroll iframe';
    [frame.style.top, frame.style.right, frame.style.bottom, frame.style.left] = [
        '0px',
        '0px',
        '0px',
        '0px',
    ];
    document.body.append(frame);
})();
