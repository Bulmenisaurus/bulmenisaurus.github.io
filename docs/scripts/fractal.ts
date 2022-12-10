// source: https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
const debounce = <FunctionType extends (...args: any[]) => void>(
    func: FunctionType,
    delay: number
) => {
    let debouncedId: number | undefined;

    return (...args: Parameters<FunctionType>) => {
        window.clearTimeout(debouncedId);

        debouncedId = window.setTimeout(() => {
            func(args);
        }, delay);
    };
};

class ControllableCanvas {
    canvasElement: HTMLCanvasElement;
    canvasX: number;
    canvasY: number;
    isDragging: boolean;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    startDragX: number;
    startDragY: number;
    reRender: () => void;
    deltaX: number;
    deltaY: number;
    zoom: number;
    worker: Worker;
    debug: (message: string) => void;
    startRender: number;
    u: { real: number; imag: number };
    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        worker: Worker,
        debugFunction: (message: string) => void
    ) {
        this.canvasElement = canvas;
        this.ctx = ctx;
        this.canvasX = 0;
        this.canvasY = 0;
        this.worker = worker;

        this.width = 500;
        this.height = 500;
        this.zoom = 1;

        this.isDragging = false;
        this.startDragX = 0;
        this.startDragY = 0;
        this.startRender = 0;

        this.deltaX = 0;
        this.deltaY = 0;

        this.u = {
            real: 0.35,
            imag: 0.35,
        };

        this.reRender = debounce(this.render.bind(this), 100);
        this.debug = debugFunction;

        this.resize();

        const debouncedResize = debounce(this.resize.bind(this), 100);

        window.addEventListener('resize', (e) => debouncedResize());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        worker.addEventListener('message', (e) => this.onMessage(e));
        worker.addEventListener('error', (e) => console.error(e));
    }

    resize() {
        const container = this.canvasElement.parentElement!;
        const containerSize = container.getBoundingClientRect();

        const width = Math.round(containerSize.width);
        const height = Math.round(containerSize.height);

        this.canvasElement.width = width;
        this.canvasElement.height = height;

        this.width = width;
        this.height = height;

        this.reRender();
    }

    onWheel(e: WheelEvent) {
        const scrollAmount = e.deltaY;

        // prevents zooming in entire page when pinch to scrolling
        e.preventDefault();

        /*
        const isFirefox = navigator.userAgent.indexOf('Firefox') > 0;
        return isFirefox ? 1.005 : 1.0006;
        */

        const base = 1.005;

        this.zoom *= 1 / base ** scrollAmount;

        this.reRender();
    }

    onMouseDown(e: MouseEvent) {
        this.isDragging = true;
        this.startDragX = e.offsetX;
        this.startDragY = e.offsetY;
    }

    onMouseUp(e: MouseEvent) {
        this.isDragging = false;

        this.canvasX += this.deltaX;
        this.canvasY += this.deltaY;

        this.deltaX = 0;
        this.deltaY = 0;
    }

    onMouseMove(e: MouseEvent) {
        if (!this.isDragging) {
            return;
        }

        const canvasScreenSize = this.canvasElement.getBoundingClientRect();

        this.deltaX = (e.offsetX - this.startDragX) * (1 / (canvasScreenSize.width * this.zoom));
        this.deltaY = (e.offsetY - this.startDragY) * (1 / (canvasScreenSize.height * this.zoom));

        this.reRender();
    }

    onMessage(e: MessageEvent<Uint8ClampedArray>) {
        const imageData = this.ctx.createImageData(this.width, this.height);
        imageData.data.set(e.data);
        this.ctx.putImageData(imageData, 0, 0);
        //TODO: fix case where multiple
        this.debug(`Took ${Date.now() - this.startRender}ms to render`);
    }

    render() {
        this.startRender = Date.now();
        this.worker.postMessage([
            this.width,
            this.height,
            this.canvasX + this.deltaX,
            this.canvasY + this.deltaY,
            this.zoom,
            this.u.real,
            this.u.imag,
        ]);
    }
}

const getConfigFromURLQuery = () => {
    const queryString = new URLSearchParams(window.location.search);
    return {
        real: queryString.get('real'),
        imag: queryString.get('imag'),
        //TODO: maybe size?
    };
};

const main = async () => {
    const canvas = <HTMLCanvasElement>document.getElementById('main-canvas');
    const debugContainer = <HTMLPreElement>document.getElementById('debug');

    const realTextInput = <HTMLInputElement>document.getElementById('real-input');
    const realSlideInput = <HTMLInputElement>document.getElementById('real-slider');

    const imagTextInput = <HTMLInputElement>document.getElementById('imag-input');
    const imagSlideInput = <HTMLInputElement>document.getElementById('imag-slider');

    const zoomTextInput = <HTMLInputElement>document.getElementById('zoom-input');
    const zoomSlideInput = <HTMLInputElement>document.getElementById('zoom-input');

    // const resolutionInput = <HTMLInputElement>document.getElementById('resolution');

    const ctx = canvas.getContext('2d')!;

    canvas.width = 500;
    canvas.height = 500;

    const { real: givenReal, imag: givenImag } = getConfigFromURLQuery();
    if (givenReal !== null) {
        realTextInput.value = givenReal;
        realSlideInput.value = givenReal;
    }

    if (givenImag !== null) {
        imagTextInput.value = givenImag;
        imagSlideInput.value = givenImag;
    }

    const renderThread = new Worker('./dist/fractal.worker.js');

    const interactiveCanvas = new ControllableCanvas(canvas, ctx, renderThread, (e) => {
        debugContainer.innerText = e;
    });

    const realTextInputChange = (r: boolean = true) => {
        realSlideInput.value = realTextInput.value;
        interactiveCanvas.u.real = parseFloat(realTextInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const realSlideInputChange = (r: boolean = true) => {
        realTextInput.value = realSlideInput.value;
        interactiveCanvas.u.real = parseFloat(realSlideInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const imagTextInputChange = (r: boolean = true) => {
        imagSlideInput.value = imagTextInput.value;
        interactiveCanvas.u.imag = parseFloat(imagTextInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const imagSlideInputChange = (r: boolean = true) => {
        imagTextInput.value = imagSlideInput.value;
        interactiveCanvas.u.imag = parseFloat(imagSlideInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const zoomTextInputChange = (r: boolean = true) => {
        zoomSlideInput.value = zoomTextInput.value;
        interactiveCanvas.zoom = parseFloat(zoomTextInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const zoomSlideInputChange = (r: boolean = true) => {
        zoomTextInput.value = zoomSlideInput.value;
        interactiveCanvas.zoom = parseFloat(zoomSlideInput.value);

        if (r) interactiveCanvas.reRender();
    };

    realTextInputChange(false);
    imagTextInputChange(false);
    zoomTextInputChange(false);

    realTextInput.addEventListener('change', () => realTextInputChange());
    realSlideInput.addEventListener('change', () => realSlideInputChange());

    imagTextInput.addEventListener('change', () => imagTextInputChange());
    imagSlideInput.addEventListener('change', () => imagSlideInputChange());

    zoomTextInput.addEventListener('input', () => zoomTextInputChange());
    zoomSlideInput.addEventListener('input', () => zoomSlideInputChange());

    // only render after the config above has been set
    interactiveCanvas.render();
};

main();
export {};
