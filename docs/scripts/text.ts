class Frame {
    width: number;
    height: number;
    characters: string[][];
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.characters = [];

        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push('');
            }
            this.characters.push(row);
        }
    }

    get content() {
        return this.characters.map((r) => r.join('')).join('\n');
    }
}

interface AsciiDocumentOptions {}

class AsciiDocument {
    target: HTMLElement;
    beforeRender: (a: Frame) => void;
    lastFrame: Frame | undefined;

    constructor(target: HTMLElement, beforeRender: (a: Frame) => void) {
        this.target = target;
        this.beforeRender = beforeRender;

        this.render();
        window.addEventListener('resize', () => {
            this.render();
        });
    }

    /**
     * responsible for drawing a frame to this screen
     *! re-renders only when the screen is resized
     */
    render() {
        const charHeight = Math.floor(window.innerHeight / 16);
        const charWidth = Math.floor(window.innerWidth / 7.8333);

        const frame = new Frame(charWidth, charHeight);

        this.beforeRender(frame);

        this.lastFrame = frame;

        this.target.innerText = frame.content;
    }

    /**
     * Changes the frame in-between re-renders
     * @param callback the callback which handles changing the frame
     */
    updateFrameBetweenRenders(callback: (a: Frame) => void) {
        const lastFrame = this.lastFrame;

        if (!lastFrame) return;

        const originalCharacters = lastFrame.characters;

        lastFrame.characters = lastFrame.characters.map((p) => [...p]);

        callback(lastFrame);

        this.target.innerText = lastFrame.content;

        lastFrame.characters = originalCharacters;
    }
}

const drawHorizontalLine = (frame: Frame, y: number, x1: number, x2: number, fillChar: string) => {
    const [left, right] = [x1, x2].sort();
    for (let i = left; i < right; i++) {
        frame.characters[y][i] = fillChar;
    }
};

const drawVerticalLine = (frame: Frame, x: number, y1: number, y2: number, fillChar: string) => {
    const [top, bottom] = [y1, y2].sort();
    for (let i = top; i < bottom; i++) {
        frame.characters[i][x] = fillChar;
    }
};

const fill = (frame: Frame, char: string) => {
    for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {
            frame.characters[y][x] = char;
        }
    }
};

const wrapText = (text: string, width: number) => {
    let res = '';

    if (width < 1) {
        return res;
    }

    while (text.length > width) {
        let found = false;
        // Inserts new line at first whitespace of the line
        for (let i = width - 1; i >= 0; i--) {
            if (text[i] === ' ') {
                res = res + [text.slice(0, i), '\n'].join('');
                text = text.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [text.slice(0, width), '\n'].join('');
            text = text.slice(width);
        }
    }

    return res + text;
};

const centerText = (text: string, width: number) => {
    const paddingAmount = width - text.length;

    if (paddingAmount < 1) {
        return text;
    }

    const leftPad = Math.ceil(paddingAmount / 2);
    const rightPad = Math.floor(paddingAmount / 2);

    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
};

const centerBlock = (text: string, width: number) => {
    return text
        .split('\n')
        .map((p) => centerText(p, width))
        .join('\n');
};

interface WriteOptions {
    wrapping: 'clip' | 'wrap';
}

const writeBlock = (frame: Frame, x: number, y: number, content: string, options: WriteOptions) => {
    let lines: string[];
    if (options.wrapping === 'wrap') {
        const wrappedText = wrapText(content, frame.width);
        lines = wrappedText.split('\n');
    } else {
        lines = content.split('\n');
    }

    for (let iy = 0; iy < lines.length; iy++) {
        for (let ix = 0; ix < lines[iy].length; ix++) {
            // block is too wide
            if (ix + x >= frame.width) {
                continue;
            }
            // block is too tall
            if (iy + y >= frame.height) {
                continue;
            }

            frame.characters[iy + y][ix + x] = lines[iy][ix];
        }
    }
};

const writeFrame = (frame: Frame, x: number, y: number, contentFrame: Frame) => {
    writeBlock(frame, x, y, contentFrame.content, { wrapping: 'clip' });
};

const asciiDocument = new AsciiDocument(document.body, (frame) => {
    // This part draws the border
    fill(frame, ' ');

    drawHorizontalLine(frame, 0, 0, frame.width, '─');
    drawHorizontalLine(frame, frame.height - 1, 0, frame.width, '─');

    drawVerticalLine(frame, 0, 0, frame.height, '│');
    drawVerticalLine(frame, frame.width - 1, 0, frame.height, '│');

    frame.characters[0][0] = '╭';
    frame.characters[0][frame.width - 1] = '╮';

    frame.characters[frame.height - 1][0] = '╰';
    frame.characters[frame.height - 1][frame.width - 1] = '╯';

    const contentFrame = new Frame(frame.width - 3, frame.height - 3);

    const textContent = new Frame(contentFrame.width, Math.min(contentFrame.width, 20));

    // https://patorjk.com/software/taag/#p=display&f=Cybermedium&t=WELCOME
    writeBlock(
        textContent,
        0,
        0,
        centerBlock(
            `_ _ _ ____ _    ____ ____ _  _ ____ 
| | | |___ |    |    |  | |\\/| |___ 
|_|_| |___ |___ |___ |__| |  | |___ `,
            textContent.width
        ),
        { wrapping: 'clip' }
    );

    const content = `\
Text.js is a revolutionary new framework that allows you to do cool stuff`;

    writeBlock(textContent, 0, 5, content, { wrapping: 'wrap' });

    const testimonials = new Frame(
        contentFrame.width - 1,
        contentFrame.height - textContent.height
    );
    // fill(testimonials, '┼');

    // add paragraph
    writeFrame(contentFrame, 0, 0, textContent);
    // add testimonials
    writeFrame(contentFrame, 0, textContent.height + 2, testimonials);

    // write all of the above to the screen
    writeFrame(frame, 2, 2, contentFrame);
});

let isMouseDown = false;

window.addEventListener('mousedown', () => (isMouseDown = true));
window.addEventListener('mouseup', () => (isMouseDown = false));

window.addEventListener('mousemove', (e) => {
    // stop mouse from interfering with selecting text
    if (isMouseDown) {
        return;
    }

    let mouseX = e.clientX;
    let mouseY = e.clientY;

    const mouseDocumentX = Math.floor(mouseX / 7.833333);
    const mouseDocumentY = Math.floor(mouseY / 16);

    asciiDocument.updateFrameBetweenRenders((frame) => {
        if (
            frame.characters.length > mouseDocumentY &&
            frame.characters[mouseDocumentY].length > mouseDocumentX
        ) {
            frame.characters[mouseDocumentY][mouseDocumentX] = '~';
        }
    });
});
