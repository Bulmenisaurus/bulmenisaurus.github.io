const placeholder_WasmRenderFunction = (
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
    zoom: number
) => 0;

type WasmRenderFunction = typeof placeholder_WasmRenderFunction;

// source: https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
const throttle = <FunctionType extends (...args: any[]) => void>(
    func: FunctionType,
    delay: number
) => {
    let beingThrottled: boolean = false;

    return (...args: Parameters<FunctionType>) => {
        if (!beingThrottled) {
            func(args);
            beingThrottled = true;
            setTimeout(() => {
                beingThrottled = false;
            }, delay);
        }
    };
};

class ControllableCanvas {
    canvasElement: HTMLCanvasElement;
    canvasX: number;
    canvasY: number;
    isDragging: boolean;
    renderFunction: WasmRenderFunction;
    memory: WebAssembly.Memory;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    startDragX: number;
    startDragY: number;
    reRender: () => void;
    deltaX: number;
    deltaY: number;
    zoom: number;
    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        wasmRenderFunction: WasmRenderFunction,
        wasmMemory: WebAssembly.Memory
    ) {
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

        this.reRender = throttle(this.render.bind(this), 100);

        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onWheel(e: WheelEvent) {
        const scrollAmount = e.deltaY;

        /*
        const isFirefox = navigator.userAgent.indexOf('Firefox') > 0;
        return isFirefox ? 1.005 : 1.0006;
        */

        const base = 1.005;

        this.zoom *= 1 / base ** scrollAmount;
        console.log(this.zoom);

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

    render() {
        const renderedDataPtr = this.renderFunction(
            this.width,
            this.height,
            this.canvasX + this.deltaX,
            this.canvasY + this.deltaY,
            this.zoom
        );
        const renderedData = new Uint8ClampedArray(
            this.memory.buffer,
            renderedDataPtr,
            this.width * this.height * 4
        );

        const imageData = this.ctx.createImageData(this.width, this.height);
        imageData.data.set(renderedData);
        this.ctx.putImageData(imageData, 0, 0);
    }
}

const main = async () => {
    const importObject = {
        imports: {
            render: placeholder_WasmRenderFunction,
        },
    };
    const module = await WebAssembly.instantiateStreaming(
        fetch('./fractal-wasm/pkg/fractal_wasm_bg.wasm'),
        importObject
    );

    const render = module.instance.exports.render as WasmRenderFunction;
    const memory = module.instance.exports.memory as WebAssembly.Memory;

    const canvas = <HTMLCanvasElement>document.getElementById('main-canvas');

    const ctx = canvas.getContext('2d')!;

    canvas.width = 500;
    canvas.height = 500;

    const interactiveCanvas = new ControllableCanvas(canvas, ctx, render, memory);
    interactiveCanvas.render();
};

main();
export {};
