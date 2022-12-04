const placeholder_WasmRenderFunction = (
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
    zoom: number
) => 0;

type WasmRenderFunction = typeof placeholder_WasmRenderFunction;

let render: WasmRenderFunction;
let memory: WebAssembly.Memory;
let hasMainInitialized = false;

//@ts-ignore
const main = async () => {
    const importObject = {
        imports: {
            render: placeholder_WasmRenderFunction,
        },
    };
    const module = await WebAssembly.instantiateStreaming(
        fetch('../fractal-wasm/pkg/fractal_wasm_bg.wasm'),
        importObject
    );

    render = module.instance.exports.render as WasmRenderFunction;
    memory = module.instance.exports.memory as WebAssembly.Memory;
};

self.onmessage = async (e) => {
    console.log(hasMainInitialized);
    if (!hasMainInitialized) {
        await main();
        hasMainInitialized = true;
    }

    const [width, height, offsetX, offsetY, zoom] = e.data;

    const renderedDataPtr = render(width, height, offsetX, offsetY, zoom);
    const renderedData = new Uint8ClampedArray(memory.buffer, renderedDataPtr, width * height * 4);

    postMessage(renderedData);
};
