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
    cameraPositionX: number;
    cameraPositionY: number;
    canvasIsDragging: boolean;
    canvasElementWidth: number;
    canvasElementHeight: number;
    canvasContext: CanvasRenderingContext2D;
    canvasStartPanX: number;
    canvasStartPanY: number;
    reRender: () => void;
    cameraPanDeltaX: number;
    cameraPanDeltaY: number;
    cameraZoom: number;
    cameraRenderWorker: Worker;
    debug: (message: string) => void;
    canvasStartRenderTime: number;
    fractalUConstant: { real: number; imag: number };
    cameraResolutionModifier: number;
    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        worker: Worker,
        debugFunction: (message: string) => void
    ) {
        // canvas* - stuff related to the actual <canvas> element in the DOM
        this.canvasElement = canvas;
        this.canvasContext = ctx;
        this.canvasElementWidth = 500;
        this.canvasElementHeight = 500;

        this.canvasIsDragging = false;
        this.canvasStartPanX = 0;
        this.canvasStartPanY = 0;

        this.canvasStartRenderTime = 0;

        // camera* - stuff related to the camera, like where it is located, the zoom, etc
        // also stuff related to the rendering of the final image
        this.cameraRenderWorker = worker;
        this.cameraPositionX = 0;
        this.cameraPositionY = 0;
        this.cameraZoom = 1;

        this.cameraPanDeltaX = 0;
        this.cameraPanDeltaY = 0;

        this.cameraResolutionModifier = 1;

        // fractal* - config for the fractal that is currently being rendered
        this.fractalUConstant = {
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

    get imageWidth() {
        return Math.round(this.canvasElementWidth * this.cameraResolutionModifier);
    }

    get imageHeight() {
        return Math.round(this.canvasElementHeight * this.cameraResolutionModifier);
    }

    resize() {
        const container = this.canvasElement.parentElement!;
        const containerSize = container.getBoundingClientRect();

        console.log([containerSize.width, containerSize.height]);

        this.canvasElementWidth = Math.round(containerSize.width);
        this.canvasElementHeight = Math.round(containerSize.height);

        this.canvasElement.width = this.imageWidth;
        this.canvasElement.height = this.imageHeight;

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

        this.cameraZoom *= 1 / base ** scrollAmount;
        this.onZoom(this.cameraZoom);

        this.reRender();
    }

    onZoom(zoomAmount: number) {
        //! to be overwritten by code
    }

    onMouseDown(e: MouseEvent) {
        this.canvasIsDragging = true;
        this.canvasStartPanX = e.offsetX;
        this.canvasStartPanY = e.offsetY;
    }

    onMouseUp(e: MouseEvent) {
        this.canvasIsDragging = false;

        this.cameraPositionX += this.cameraPanDeltaX;
        this.cameraPositionY += this.cameraPanDeltaY;

        this.cameraPanDeltaX = 0;
        this.cameraPanDeltaY = 0;
    }

    onMouseMove(e: MouseEvent) {
        if (!this.canvasIsDragging) {
            return;
        }

        const canvasScreenSize = this.canvasElement.getBoundingClientRect();

        this.cameraPanDeltaX =
            (e.offsetX - this.canvasStartPanX) * (1 / (canvasScreenSize.width * this.cameraZoom));
        this.cameraPanDeltaY =
            (e.offsetY - this.canvasStartPanY) * (1 / (canvasScreenSize.height * this.cameraZoom));

        this.reRender();
    }

    onMessage(e: MessageEvent<Uint8ClampedArray>) {
        const imageData = this.canvasContext.createImageData(this.imageWidth, this.imageHeight);
        imageData.data.set(e.data);
        this.canvasContext.putImageData(imageData, 0, 0);
        //TODO: fix case where multiple
        this.debug(`Took ${Date.now() - this.canvasStartRenderTime}ms to render`);
    }

    render() {
        this.canvasStartRenderTime = Date.now();
        this.cameraRenderWorker.postMessage([
            this.imageWidth,
            this.imageHeight,
            this.cameraPositionX + this.cameraPanDeltaX,
            this.cameraPositionY + this.cameraPanDeltaY,
            this.cameraZoom,
            this.fractalUConstant.real,
            this.fractalUConstant.imag,
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
    const zoomSlideInput = <HTMLInputElement>document.getElementById('zoom-slider');

    const resolutionInput = <HTMLInputElement>document.getElementById('resolution');

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
        interactiveCanvas.fractalUConstant.real = parseFloat(realTextInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const realSlideInputChange = (r: boolean = true) => {
        realTextInput.value = realSlideInput.value;
        interactiveCanvas.fractalUConstant.real = parseFloat(realSlideInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const imagTextInputChange = (r: boolean = true) => {
        imagSlideInput.value = imagTextInput.value;
        interactiveCanvas.fractalUConstant.imag = parseFloat(imagTextInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const imagSlideInputChange = (r: boolean = true) => {
        imagTextInput.value = imagSlideInput.value;
        interactiveCanvas.fractalUConstant.imag = parseFloat(imagSlideInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const zoomTextInputChange = (r: boolean = true) => {
        zoomSlideInput.value = parseFloat(zoomTextInput.value).toFixed(3);
        interactiveCanvas.cameraZoom = parseFloat(zoomTextInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const zoomSlideInputChange = (r: boolean = true) => {
        zoomTextInput.value = parseFloat(zoomSlideInput.value).toFixed(3);
        interactiveCanvas.cameraZoom = parseFloat(zoomSlideInput.value);

        if (r) interactiveCanvas.reRender();
    };

    const zoomCanvasChangeCallback: ControllableCanvas['onZoom'] = (zoom: number) => {
        zoomSlideInput.value = zoom.toFixed(3);
        zoomTextInput.value = zoom.toFixed(3);
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
    interactiveCanvas.onZoom = zoomCanvasChangeCallback;

    resolutionInput.addEventListener('change', () => {
        if (resolutionInput.value.length === 0) {
            return;
        }

        interactiveCanvas.cameraResolutionModifier = parseFloat(resolutionInput.value);
        console.log(resolutionInput.value);
        // set the new canvas size and width
        interactiveCanvas.resize();
        interactiveCanvas.reRender();
    });

    // only render after the config above has been set
    interactiveCanvas.render();
};

main();
export {};
