"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const placeholder_WasmRenderFunction = (width, height, offsetX, offsetY, zoom, uReal, uImag, is_mandlebrot) => 0;
let render;
let memory;
let hasMainInitialized = false;
//@ts-ignore
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const importObject = {
        imports: {
            render: placeholder_WasmRenderFunction,
        },
    };
    const module = yield WebAssembly.instantiateStreaming(fetch('../fractal-wasm/pkg/fractal_wasm_bg.wasm'), importObject);
    render = module.instance.exports.render;
    memory = module.instance.exports.memory;
});
self.onmessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
    if (!hasMainInitialized) {
        yield main();
        hasMainInitialized = true;
    }
    const [width, height, offsetX, offsetY, zoom, uReal, uImag, is_mandlebrot] = e.data;
    const renderedDataPtr = render(width, height, offsetX, offsetY, zoom, uReal, uImag, is_mandlebrot);
    const renderedData = new Uint8ClampedArray(memory.buffer, renderedDataPtr, width * height * 4);
    postMessage(renderedData);
});
//# sourceMappingURL=fractal.worker.js.map