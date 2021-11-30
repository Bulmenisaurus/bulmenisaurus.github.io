"use strict";
// ! YOINKED: https://medium.com/@haxzie/dark-and-light-theme-switcher-using-css-variables-and-pure-javascript-zocada-dd0059d72fa2
class ThemeChanger {
    constructor(themeTrigger) {
        this.theme = this.getTheme();
        this.themeTrigger = themeTrigger;
    }
    setTheme(theme) {
        localStorage.setItem('theme', theme);
        document.body.dataset.theme = theme;
        this.theme = theme;
        document.querySelector('.theme-emoji').innerHTML = theme === 'dark' ? '🌙' : '☀️';
        if (this.onThemeChange) {
            this.onThemeChange(theme);
        }
    }
    init() {
        if (this.onThemeChange) {
            this.onThemeChange(this.theme);
        }
        this.setTheme(this.theme);
        this.themeTrigger.addEventListener('click', () => {
            this.toggleTheme(true);
        });
    }
    toggleTheme(withTransition = false) {
        if (withTransition) {
            // Appends stylesheet which smoothly transitions everything.
            const styleSheet = document.createElement('style');
            styleSheet.innerHTML = '* {transition: .5s all}';
            styleSheet.className = 'js-theme-transition';
            document.head.appendChild(styleSheet);
            setTimeout(() => {
                styleSheet.remove();
            }, 1000);
        }
        this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }
    getTheme() {
        const storedTheme = localStorage.getItem('theme');
        const dataTheme = document.body.dataset.theme;
        // localStorage > data-theme > just dark mode
        const possibleTheme = storedTheme || dataTheme || 'dark';
        if (possibleTheme !== 'dark' && possibleTheme !== 'light') {
            return 'dark';
        }
        else {
            return possibleTheme;
        }
    }
}
//# sourceMappingURL=themechanger.js.map