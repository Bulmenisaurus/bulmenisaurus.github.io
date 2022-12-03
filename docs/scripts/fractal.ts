const main = async () => {
    const importObject = {
        imports: {
            render: (width: number, height: number, zoom: number): number => {
                return 0;
            },
        },
    };
    const module = await WebAssembly.instantiateStreaming(
        fetch('./fractal-wasm/pkg/fractal_wasm_bg.wasm'),
        importObject
    );

    const render = module.instance.exports.render as typeof importObject.imports.render;
    const memory = module.instance.exports.memory as WebAssembly.Memory;

    let time = Date.now();

    const canvas = <HTMLCanvasElement>document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d')!;
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
};

main();
export {};
