var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const placeholder_WasmRenderFunction = (width, height, offsetX, offsetY, zoom) => 0;
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
    constructor(canvas, ctx, wasmRenderFunction, wasmMemory, debugFunction) {
        this.canvasElement = canvas;
        this.ctx = ctx;
        this.canvasX = 0;
        this.canvasY = 0;
        this.renderFunction = wasmRenderFunction;
        this.memory = wasmMemory;
        this.width = 500;
        this.height = 500;
        this.zoom = 1;
        this.isDragging = false;
        this.startDragX = 0;
        this.startDragY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.reRender = debounce(this.render.bind(this), 100);
        this.debug = debugFunction;
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
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
        console.log(this.zoom);
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
    render() {
        const startDate = Date.now();
        const renderedDataPtr = this.renderFunction(this.width, this.height, this.canvasX + this.deltaX, this.canvasY + this.deltaY, this.zoom);
        const renderedData = new Uint8ClampedArray(this.memory.buffer, renderedDataPtr, this.width * this.height * 4);
        const imageData = this.ctx.createImageData(this.width, this.height);
        imageData.data.set(renderedData);
        this.ctx.putImageData(imageData, 0, 0);
        this.debug(`Took ${Date.now() - startDate}ms to render`);
    }
}
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const importObject = {
        imports: {
            render: placeholder_WasmRenderFunction,
        },
    };
    const module = yield WebAssembly.instantiateStreaming(fetch('./fractal-wasm/pkg/fractal_wasm_bg.wasm'), importObject);
    const render = module.instance.exports.render;
    const memory = module.instance.exports.memory;
    const canvas = document.getElementById('main-canvas');
    const debugContainer = document.getElementById('debug');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;
    const interactiveCanvas = new ControllableCanvas(canvas, ctx, render, memory, (e) => {
        debugContainer.innerText = e;
    });
    interactiveCanvas.render();
});
main();
export {};
//# sourceMappingURL=fractal.js.map