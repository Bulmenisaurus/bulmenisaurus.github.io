const counterElement = <HTMLDivElement>document.getElementById('counter');
const specificCounter = <HTMLDivElement>document.getElementById('specific-counter');

let paused = false;
let fullscreen = false;
let count = 0;

const query = new URLSearchParams(window.location.search);

const parsedBase = parseInt(query.get('base') ?? '10');
const base = isNaN(parsedBase) ? 10 : parsedBase;

const stored_counter = localStorage.getItem('counter');
if (stored_counter !== null) {
    const parsedCount = parseInt(stored_counter);
    if (!Number.isNaN(parsedCount)) {
        count = parsedCount;
    }
}

const toggleFullScreen = (element: Element = document.body) => {
    if (fullscreen) {
        document.exitFullscreen();
    } else {
        element.requestFullscreen();
    }
    fullscreen = !fullscreen;
};

const copyCurrentCount = async () => {
    // await so that if an error occurs, the next loc don't get executed
    await window.navigator.clipboard.writeText(count.toString());
    counterColorAnimation('#00DC82');
};

const counterColorAnimation = (color: string, animationDuration: number = 1000) => {
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

const formatSeconds = (seconds: number) => {
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
