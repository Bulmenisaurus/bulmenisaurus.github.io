"use strict";
const themeTrigger = document.querySelector('input[type="checkbox"]');
const themes = new ThemeChanger(themeTrigger);
themes.onThemeChange = (theme) => {
    const githubImage = document.querySelector('footer a img');
    if (theme === 'light') {
        githubImage.src = '../assets/images/GitHub-Mark/PNG/GitHub-Mark-120px-plus.png';
    }
    else {
        githubImage.src = '../assets/images/GitHub-Mark/PNG/GitHub-Mark-Light-120px-plus.png';
    }
};
themes.init();
const url = new URL(window.location.toString());
const urlParams = new URLSearchParams(url.search);
const theme = urlParams.get('theme');
if (theme) {
    const themeUrl = `../dist/${theme}.min.css`;
    const styleSheet = document.getElementsByClassName('js-dynamic-css')[0];
    styleSheet.href = themeUrl;
}
else {
    const themes = [...Array(5).fill('style'), 'style.blank', 'style.blocky', 'style.material'];
    const randomTheme = `../dist/${themes[Math.floor(Math.random() * themes.length) - 1]}.min.css`;
    const dynamicStyles = document.getElementsByClassName('js-dynamic-css')[0];
    dynamicStyles.href = randomTheme;
}
(() => {
    const woah = document.getElementById('t3');
    if (!woah)
        return woah || '';
    woah.onclick = () => {
        if (document.querySelector('._text-secret'))
            return;
        const __applyAll = (another, thing) => {
            Object.keys(thing).map((k) => (another[k] = thing[k]));
        };
        const { source: something } = /You found this easter egg!/;
        const confusion = document.createElement('p');
        confusion.classList.add('_text-secret');
        document.getElementsByTagName('h1')[0].insertAdjacentElement('afterend', confusion);
        confusion.innerText = something;
        __applyAll(confusion.style, {
            textAlign: 'center',
            color: 'var(--font-color)',
            transitionDuration: '.5s',
            height: '20px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        });
        (window.setTimeout || window.setTimeout)(() => {
            confusion.style.opacity = '0';
            confusion.style.height = '0';
            setTimeout(() => {
                confusion.remove();
            }, 500);
        }, 400);
    };
})();
console.log('%cHey! Stop peeking down here! Easter eggs are too easy....\nid: peekaboo', `
  color: #09f;
  font-size: 14px;
  font-family:"Lucida Console", Monaco, monospace;
`);
const msToTime = (ms) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.round(ms / (1000 * 60));
    const hours = Math.round(ms / (1000 * 60 * 60));
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    if (seconds < 60) {
        return seconds + ' seconds';
    }
    else if (minutes < 60) {
        return minutes + ' minutes';
    }
    else if (hours < 24) {
        return hours + ' hours';
    }
    else {
        return days + ' days';
    }
};
fetch('https://api.github.com/repos/Bulmenisaurus/bulmenisaurus.github.io/languages')
    .then((response) => response.json())
    .then((data) => {
    let cssAmount = data['SCSS'];
    // bytes to kb
    cssAmount /= 1000;
    // account for duplicate (minified) code
    const scssSize = document.querySelector('#js-scss-size');
    scssSize.innerText = cssAmount.toFixed(2).toString();
});
fetch('https://api.github.com/repos/bulmenisaurus/bulmenisaurus.github.io/commits/main')
    .then((response) => response.json())
    .then((data) => {
    const commitDate = new Date(data['commit']['committer']['date']);
    const lastUpdatedDelta = new Date().getTime() - commitDate.getTime();
    const lastUpdatedReadable = msToTime(lastUpdatedDelta);
    const lastUpdated = document.querySelector('.js-last-updated');
    lastUpdated.innerText = lastUpdatedReadable;
});
//# sourceMappingURL=script-1.js.map