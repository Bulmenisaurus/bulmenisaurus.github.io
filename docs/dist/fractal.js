const squareAdd = (num1, num2) => {
    /*
    (a + bi)^2 = (a + bi)(a + bi) = a^2 + abi + abi + (bi)^2 = a^2 - b^2 + 2abi
    real = a^2 - b^2
    imag: 2ab
    */
    return {
        real: num1.real ** 2 - num1.imag ** 2 + num2.real,
        imag: 2 * num1.imag * num1.real + num2.imag,
    };
};
const magnitude = (z) => Math.sqrt(z.real ** 2 + z.imag ** 2);
const seemsToConverge = (z) => magnitude(z) < 10;
const strangeConvergence = (z) => Math.abs(z.real) < 10 || Math.abs(z.imag) < 10;
const getPixelColor = (x, y, width, height) => {
    const scaleFactor = 1 / 2000;
    const fractalX = (x - width / 2) * scaleFactor;
    const fractalY = (y - height / 2) * scaleFactor;
    let a = { real: 0, imag: 0 };
    let c = { real: 0, imag: 0 };
    let e = { real: 0, imag: 0 };
    let f = { real: 0, imag: 0 };
    let z = {
        real: fractalX,
        imag: fractalY,
    };
    //! Can be modified, book suggests 0.35 + 0.35i
    let u = {
        real: 0.35,
        imag: 0.35,
    };
    const amountIterations = 50;
    let resultI = amountIterations;
    for (let i = 0; i < amountIterations; i++) {
        debugger;
        a = z;
        e = squareAdd(a, u); //!
        c = squareAdd(e, u); //!
        f = squareAdd(c, u); //!
        a = squareAdd(f, u); //!
        z = a;
        if (!seemsToConverge(z)) {
            resultI = i;
            break;
        }
    }
    let colorBrightness = Math.floor((255 / amountIterations) * resultI);
    if (strangeConvergence(c)) {
        return colorBrightness;
    }
    else {
        return 255;
    }
};
const renderFractal = (ctx, width, height) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
    let pixelData = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let color = getPixelColor(x, y, width, height);
            pixelData.push(color); //r
            pixelData.push(color); //g
            pixelData.push(color); //b
            pixelData.push(255); // alpha
        }
    }
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(new Uint8ClampedArray(pixelData));
    ctx.putImageData(imageData, 0, 0);
};
const main = () => {
    const startTime = Date.now();
    const mainCanvas = document.getElementById('main-canvas');
    const ctx = mainCanvas.getContext('2d');
    if (ctx === null) {
        throw new Error('unable to get ctx');
    }
    let width = 2000;
    let height = 2000;
    mainCanvas.width = width;
    mainCanvas.height = height;
    renderFractal(ctx, width, height);
    alert(`Elapsed ${Date.now() - startTime}`);
};
main();
export {};
//# sourceMappingURL=fractal.js.map