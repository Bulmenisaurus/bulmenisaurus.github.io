var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// source: https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
const debounce = (func, delay) => {
    let debouncedId;
    return (...args) => {
        window.clearTimeout(debouncedId);
        debouncedId = window.setTimeout(() => {
            func(args);
        }, delay);
    };
};
class ControllableCanvas {
    constructor(canvas, ctx, worker, debugFunction) {
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
        this.fractalType = 0;
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
        const container = this.canvasElement.parentElement;
        const containerSize = container.getBoundingClientRect();
        console.log([containerSize.width, containerSize.height]);
        this.canvasElementWidth = Math.round(containerSize.width);
        this.canvasElementHeight = Math.round(containerSize.height);
        this.canvasElement.width = this.imageWidth;
        this.canvasElement.height = this.imageHeight;
        this.reRender();
    }
    onWheel(e) {
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
    onZoom(zoomAmount) {
        //! to be overwritten by code
    }
    onMouseDown(e) {
        this.canvasIsDragging = true;
        this.canvasStartPanX = e.offsetX;
        this.canvasStartPanY = e.offsetY;
    }
    onMouseUp(e) {
        this.canvasIsDragging = false;
        this.cameraPositionX += this.cameraPanDeltaX;
        this.cameraPositionY += this.cameraPanDeltaY;
        this.cameraPanDeltaX = 0;
        this.cameraPanDeltaY = 0;
    }
    onMouseMove(e) {
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
    onMessage(e) {
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
            this.fractalType === 1,
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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const canvas = document.getElementById('main-canvas');
    const debugContainer = document.getElementById('debug');
    const realTextInput = document.getElementById('real-input');
    const realSlideInput = document.getElementById('real-slider');
    const imagTextInput = document.getElementById('imag-input');
    const imagSlideInput = document.getElementById('imag-slider');
    const zoomTextInput = document.getElementById('zoom-input');
    const zoomSlideInput = document.getElementById('zoom-slider');
    const resolutionInput = document.getElementById('resolution');
    const fractalTypeContainer = document.getElementById('fractal-type');
    const ctx = canvas.getContext('2d');
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
    const realTextInputChange = (r = true) => {
        realSlideInput.value = realTextInput.value;
        interactiveCanvas.fractalUConstant.real = parseFloat(realTextInput.value);
        if (r)
            interactiveCanvas.reRender();
    };
    const realSlideInputChange = (r = true) => {
        realTextInput.value = realSlideInput.value;
        interactiveCanvas.fractalUConstant.real = parseFloat(realSlideInput.value);
        if (r)
            interactiveCanvas.reRender();
    };
    const imagTextInputChange = (r = true) => {
        imagSlideInput.value = imagTextInput.value;
        interactiveCanvas.fractalUConstant.imag = parseFloat(imagTextInput.value);
        if (r)
            interactiveCanvas.reRender();
    };
    const imagSlideInputChange = (r = true) => {
        imagTextInput.value = imagSlideInput.value;
        interactiveCanvas.fractalUConstant.imag = parseFloat(imagSlideInput.value);
        if (r)
            interactiveCanvas.reRender();
    };
    const zoomTextInputChange = (r = true) => {
        zoomSlideInput.value = parseFloat(zoomTextInput.value).toFixed(3);
        interactiveCanvas.cameraZoom = parseFloat(zoomTextInput.value);
        if (r)
            interactiveCanvas.reRender();
    };
    const zoomSlideInputChange = (r = true) => {
        zoomTextInput.value = parseFloat(zoomSlideInput.value).toFixed(3);
        interactiveCanvas.cameraZoom = parseFloat(zoomSlideInput.value);
        if (r)
            interactiveCanvas.reRender();
    };
    const zoomCanvasChangeCallback = (zoom) => {
        zoomSlideInput.value = zoom.toFixed(3);
        zoomTextInput.value = zoom.toFixed(3);
    };
    const fractalTypeRadioChange = (rerender = true) => {
        const selectedRadio = fractalTypeContainer.querySelector('input[type="radio"]:checked');
        if (selectedRadio === null) {
            throw new Error('cannot find selected radio button');
        }
        const fractalTypeEnum = {
            julia: 0,
            mandelbrot: 1,
        };
        if (!(selectedRadio.value in fractalTypeEnum)) {
            throw new Error(`Unknown fractal type ${selectedRadio.value}, expected one of ${Object.keys(fractalTypeEnum)}`);
        }
        const fractalType = fractalTypeEnum[selectedRadio.value];
        interactiveCanvas.fractalType = fractalType;
        if (rerender)
            interactiveCanvas.reRender();
    };
    realTextInputChange(false);
    imagTextInputChange(false);
    zoomTextInputChange(false);
    fractalTypeRadioChange(false);
    realTextInput.addEventListener('change', () => realTextInputChange());
    realSlideInput.addEventListener('change', () => realSlideInputChange());
    imagTextInput.addEventListener('change', () => imagTextInputChange());
    imagSlideInput.addEventListener('change', () => imagSlideInputChange());
    zoomTextInput.addEventListener('input', () => zoomTextInputChange());
    zoomSlideInput.addEventListener('input', () => zoomSlideInputChange());
    interactiveCanvas.onZoom = zoomCanvasChangeCallback;
    fractalTypeContainer.querySelectorAll('input[type="radio"]').forEach((elem) => {
        elem.addEventListener('input', (e) => fractalTypeRadioChange());
    });
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
    interactiveCanvas.reRender();
});
main();
export {};
//# sourceMappingURL=fractal.js.map