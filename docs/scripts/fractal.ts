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

        this.width = 600;
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

        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        worker.addEventListener('message', (e) => this.onMessage(e));
        worker.addEventListener('error', (e) => console.error(e));
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

    const realInput = <HTMLInputElement>document.getElementById('real');
    const imagInput = <HTMLInputElement>document.getElementById('imag');
    const resolutionInput = <HTMLInputElement>document.getElementById('resolution');
    const zoomInput = <HTMLInputElement>document.getElementById('zoom');

    const ctx = canvas.getContext('2d')!;

    canvas.width = 500;
    canvas.height = 500;

    const { real: givenReal, imag: givenImag } = getConfigFromURLQuery();
    if (givenReal !== null) {
        realInput.value = givenReal;
    }

    if (givenImag !== null) {
        imagInput.value = givenImag;
    }

    const renderThread = new Worker('./dist/fractal.worker.js');

    const interactiveCanvas = new ControllableCanvas(canvas, ctx, renderThread, (e) => {
        debugContainer.innerText = e;
    });

    const paramChangeHandler = (shouldReRender: boolean = true) => {
        let realValue = parseFloat(realInput.value);
        let imagValue = parseFloat(imagInput.value);
        let resolutionValue = parseFloat(resolutionInput.value);
        let zoomValue = parseFloat(zoomInput.value);

        if (isNaN(realValue)) {
            realValue = 0;
            realInput.value = '0';
        }

        if (isNaN(imagValue)) {
            imagValue = 0;
            imagInput.value = '0';
        }

        if (isNaN(resolutionValue)) {
            resolutionValue = 500;
            resolutionInput.value = '500';
        }

        interactiveCanvas.u.real = realValue;
        interactiveCanvas.u.imag = imagValue;

        interactiveCanvas.zoom = zoomValue / 10;

        console.log({ realValue, imagValue, resolutionValue, zoomValue });

        // only change canvas dimensions if they are actually different,
        // since changing the size of the canvas erases it's contents.
        // clearing the canvas and rendering dark values rapidly makes the canvas blink
        if (canvas.width !== resolutionValue) {
            interactiveCanvas.width =
                interactiveCanvas.height =
                canvas.width =
                canvas.height =
                    resolutionValue;
        }

        interactiveCanvas.reRender();
    };

    // don't render here at first
    paramChangeHandler(false);

    realInput.addEventListener('change', () => paramChangeHandler());
    imagInput.addEventListener('change', () => paramChangeHandler());
    resolutionInput.addEventListener('change', () => paramChangeHandler());
    zoomInput.addEventListener('input', () => paramChangeHandler());

    // only render after the config above has been set
    interactiveCanvas.render();
};

main();
export {};
