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
        const container = this.canvasElement.parentElement;
        const containerSize = container.getBoundingClientRect();
        const width = Math.round(containerSize.width);
        const height = Math.round(containerSize.height);
        this.canvasElement.width = width;
        this.canvasElement.height = height;
        this.width = width;
        this.height = height;
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
        this.zoom *= 1 / base ** scrollAmount;
        this.reRender();
    }
    onMouseDown(e) {
        this.isDragging = true;
        this.startDragX = e.offsetX;
        this.startDragY = e.offsetY;
    }
    onMouseUp(e) {
        this.isDragging = false;
        this.canvasX += this.deltaX;
        this.canvasY += this.deltaY;
        this.deltaX = 0;
        this.deltaY = 0;
    }
    onMouseMove(e) {
        if (!this.isDragging) {
            return;
        }
        const canvasScreenSize = this.canvasElement.getBoundingClientRect();
        this.deltaX = (e.offsetX - this.startDragX) * (1 / (canvasScreenSize.width * this.zoom));
        this.deltaY = (e.offsetY - this.startDragY) * (1 / (canvasScreenSize.height * this.zoom));
        this.reRender();
    }
    onMessage(e) {
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
const main = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        const canvas = document.getElementById('main-canvas');
        const debugContainer = document.getElementById('debug');
        const realTextInput = document.getElementById('real-input');
        const realSlideInput = document.getElementById('real-slider');
        const imagTextInput = document.getElementById('imag-input');
        const imagSlideInput = document.getElementById('imag-slider');
        const zoomTextInput = document.getElementById('zoom-input');
        const zoomSlideInput = document.getElementById('zoom-input');
        // const resolutionInput = <HTMLInputElement>document.getElementById('resolution');
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
            interactiveCanvas.u.real = parseFloat(realTextInput.value);
            if (r) interactiveCanvas.reRender();
        };
        const realSlideInputChange = (r = true) => {
            realTextInput.value = realSlideInput.value;
            interactiveCanvas.u.real = parseFloat(realSlideInput.value);
            if (r) interactiveCanvas.reRender();
        };
        const imagTextInputChange = (r = true) => {
            imagSlideInput.value = imagTextInput.value;
            interactiveCanvas.u.imag = parseFloat(imagTextInput.value);
            if (r) interactiveCanvas.reRender();
        };
        const imagSlideInputChange = (r = true) => {
            imagTextInput.value = imagSlideInput.value;
            interactiveCanvas.u.imag = parseFloat(imagSlideInput.value);
            if (r) interactiveCanvas.reRender();
        };
        const zoomTextInputChange = (r = true) => {
            zoomSlideInput.value = zoomTextInput.value;
            interactiveCanvas.zoom = parseFloat(zoomTextInput.value);
            if (r) interactiveCanvas.reRender();
        };
        const zoomSlideInputChange = (r = true) => {
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
    });
main();
export {};
//# sourceMappingURL=fractal.js.map
