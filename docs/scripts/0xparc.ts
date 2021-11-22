// https://stackoverflow.com/a/19303725/13996389
const seededRandom = (seed: number) => {
    return Math.sin(seed * 1_000) / 2 + 0.5;
};

const coordinateDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.x) ** 2);
};

class SvgDrawer {
    svgPaths: HTMLElement[];
    private _svgElement: SVGSVGElement;
    constructor() {
        this._svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        this._svgElement.setAttribute('viewBox', '0 0 100 100');

        this.svgPaths = [];
    }

    createLine(x1: number, y1: number, x2: number, y2: number, color: string) {
        const svgPath = `M ${x1} ${y1} L ${x2} ${y2}`;

        // apparently this does not work with just `document.createElement`...
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        pathElement.setAttribute('d', svgPath);
        pathElement.setAttribute('stroke-width', '2');
        pathElement.setAttribute('stroke', 'black');
        pathElement.setAttribute('stroke-linecap', 'round');
        pathElement.setAttribute('stroke', color);

        this._svgElement.appendChild(pathElement);
    }

    get svg() {
        return this._svgElement;
    }
}

class LogoGenerator {
    logo: SvgDrawer;

    seed: number;

    constructor(seed: number) {
        this.logo = new SvgDrawer();
        this.seed = seed;
    }

    random() {
        const res = seededRandom(this.seed);

        this.seed++;

        return res;
    }

    create() {
        const amountOfLines = Math.floor(this.random() * 6) + 4;

        for (let i = 0; i < amountOfLines; i++) {
            this.randomLine(20, 50);
        }

        return this.logo.svg;
    }

    randomColor() {
        const hue = Math.round(this.random() * 360);
        if (this.random() > 0.25) {
            return `hsl(${hue}, 49%, 75%)`;
        } else {
            return `hsl(${hue}, 38%, 45%)`;
        }
    }

    randomPoint() {
        // not x100 because lines could get cut off
        return {
            x: Math.round(this.random() * 80) + 10,
            y: Math.round(this.random() * 80) + 10,
        };
    }

    randomLine(minLength: number, maxLength: number) {
        const firstPoint = this.randomPoint();

        let point2 = this.randomPoint();

        do {
            point2 = this.randomPoint();
        } while (
            minLength <= coordinateDistance(firstPoint, point2) &&
            coordinateDistance(firstPoint, point2) <= maxLength
        );

        this.logo.createLine(firstPoint.x, firstPoint.y, point2.x, point2.y, this.randomColor());
    }
}

const getSeed = () => {
    const providedSeed = new URLSearchParams(window.location.search).get('seed');

    if (providedSeed === null || isNaN(parseInt(providedSeed))) {
        const seed = Math.floor(Math.random() * 1000);

        const newParams = new URLSearchParams(window.location.search);
        newParams.set('seed', seed.toString());

        window.location.search = newParams.toString();

        return seed;
    } else {
        return parseInt(providedSeed);
    }
};

const generate = (seed: number) => {
    const logo = new LogoGenerator(seed).create();
    document.getElementById('logo-container')!.appendChild(logo);
};

const copyButton = document.getElementById('copy') as HTMLButtonElement;
const generateButton = document.getElementById('generate') as HTMLButtonElement;

copyButton.addEventListener('click', async () => {
    await window.navigator.clipboard.writeText(
        document.getElementById('logo-container')!.outerHTML
    );
});

generateButton.addEventListener('click', () => {
    const newSeed = Math.floor(Math.random() * 10_000);

    const newParams = new URLSearchParams(window.location.search);
    newParams.set('seed', newSeed.toString());

    window.location.search = newParams.toString();
});

const seed = getSeed();
generate(seed);
