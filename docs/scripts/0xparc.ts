const coordinateDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
};

class SvgDrawer {
    svgPaths: HTMLElement[];
    private _svgElement: SVGSVGElement;
    constructor() {
        this._svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        this._svgElement.setAttribute('viewBox', '0 0 100 100');
        this._svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

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

class RandomGenerator {
    m_w: number;
    m_z: number;
    mask: number;
    // https://stackoverflow.com/a/19301306/13996389

    // https://stackoverflow.com/a/19303725/13996389
    // (math.sin) was giving weird patterns, this one seems more random
    constructor() {
        this.m_w = 123456789;
        this.m_z = 987654321;
        this.mask = 0xffffffff;

        return this;
    }

    // Takes any integer
    setSeed(i: number) {
        this.m_w = (123456789 + i) & this.mask;
        this.m_z = (987654321 - i) & this.mask;

        return this;
    }

    // Returns number between 0 (inclusive) and 1.0 (exclusive),
    // just like Math.random().
    // this definitely looks like it's doing something so ¯\_(ツ)_/¯
    random() {
        this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
        this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
        var result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
        result /= 4294967296;
        return result;
    }
}

class LogoGenerator {
    logo: SvgDrawer;
    randomGenerator: RandomGenerator;

    constructor(seed: number) {
        this.logo = new SvgDrawer();
        this.randomGenerator = new RandomGenerator().setSeed(seed);
    }

    random() {
        return this.randomGenerator.random();
    }

    create() {
        const amountOfLines = Math.floor(this.random() * 6) + 4;

        for (let i = 0; i < amountOfLines; i++) {
            this.randomLine(20, 80);
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
        let point2 = this.randomPoint();
        const firstPoint = this.randomPoint();

        while (
            // continue running while the line is either shorter than the min length
            // OR
            // longer than the max length
            coordinateDistance(firstPoint, point2) <= minLength ||
            coordinateDistance(firstPoint, point2) >= maxLength
        ) {
            point2 = this.randomPoint();
        }

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
    await window.navigator.clipboard.writeText(document.getElementsByTagName('svg')[0].outerHTML);
});

generateButton.addEventListener('click', () => {
    const newSeed = Math.floor(Math.random() * 10_000);

    const newParams = new URLSearchParams(window.location.search);
    newParams.set('seed', newSeed.toString());

    window.location.search = newParams.toString();
});

const seed = getSeed();
generate(seed);
