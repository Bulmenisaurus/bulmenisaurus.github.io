'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var _a;
const counterElement = document.getElementById('counter');
const specificCounter = document.getElementById('specific-counter');
let paused = false;
let fullscreen = false;
let count = 0;
const query = new URLSearchParams(window.location.search);
const parsedBase = parseInt((_a = query.get('base')) !== null && _a !== void 0 ? _a : '10');
const base = isNaN(parsedBase) ? 10 : parsedBase;
const stored_counter = localStorage.getItem('counter');
if (stored_counter !== null) {
    const parsedCount = parseInt(stored_counter);
    if (!Number.isNaN(parsedCount)) {
        count = parsedCount;
    }
}
const toggleFullScreen = (element = document.body) => {
    if (fullscreen) {
        document.exitFullscreen();
    } else {
        element.requestFullscreen();
    }
    fullscreen = !fullscreen;
};
const copyCurrentCount = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        // await so that if an error occurs, the next loc don't get executed
        yield window.navigator.clipboard.writeText(count.toString());
        counterColorAnimation('#00DC82');
    });
const counterColorAnimation = (color, animationDuration = 1000) => {
    counterElement.style.transition = `0ms color`;
    counterElement.style.color = color;
    setTimeout(() => {
        counterElement.style.transition = `${animationDuration}ms color`;
        counterElement.style.color = 'white';
    }, 1);
    setTimeout(() => {
        counterElement.style.transition = '';
    }, animationDuration + 1);
};
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        paused = !paused;
    } else if (e.key === 'f') {
        toggleFullScreen();
    } else if (e.key === 'c') {
        copyCurrentCount();
    }
});
const formatSeconds = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
};
const updateCount = () => {
    if (count % 10 === 0) {
        document.title = `Counter [${count.toString()}]`;
    }
    counterElement.innerText = count.toString(base);
    specificCounter.innerText = formatSeconds(count);
};
updateCount();
setInterval(() => {
    if (!paused) {
        count++;
        updateCount();
    }
}, 1000);
window.addEventListener('beforeunload', () => {
    localStorage.setItem('counter', count.toString());
});
//# sourceMappingURL=counter.js.map
