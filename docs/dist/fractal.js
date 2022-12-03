var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const importObject = {
        imports: {
            render: (width, height, zoom) => {
                return 0;
            },
        },
    };
    const module = yield WebAssembly.instantiateStreaming(fetch('../fractal-wasm/pkg/fractal_wasm_bg.wasm'), importObject);
    const render = module.instance.exports.render;
    const memory = module.instance.exports.memory;
    let time = Date.now();
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const width = 2000;
    const height = 2000;
    canvas.width = width;
    canvas.height = height;
    const renderedDataPtr = render(width, height, 1);
    const renderedData = new Uint8ClampedArray(memory.buffer, renderedDataPtr, width * height * 4);
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(renderedData);
    ctx.putImageData(imageData, 0, 0);
    alert(Date.now() - time);
});
main();
export {};
//# sourceMappingURL=fractal.js.map