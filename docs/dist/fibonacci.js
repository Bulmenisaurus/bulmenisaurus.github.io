debugger;
const fibonacciCavas = document.createElement('canvas');
fibonacciCavas.width = 2000;
fibonacciCavas.height = 2000;
let cellSideLength = 10;
document.body.appendChild(fibonacciCavas);
const fibCache = new Map();
// 1, 1, 2, 3, 5, ...
const fibonacci = (n) => {
    if (fibCache.has(n)) {
        return fibCache.get(n);
    }
    if (n <= 1) {
        return BigInt(1);
    }
    const res = fibonacci(n - 1) + fibonacci(n - 2);
    fibCache.set(n, res);
    return res;
};
const main = () => {
    const ctx = fibonacciCavas.getContext('2d');
    if (ctx === null) {
        throw new Error('CTX is null');
    }
    for (let x = 0; x < fibonacciCavas.width / cellSideLength; x++) {
        for (let y = 0; y < fibonacciCavas.height / cellSideLength; y++) {
            ctx.fillStyle = 'black';
            if ((fibonacci(x) & (BigInt(1) << BigInt(y))) > BigInt(0)) {
                ctx.fillRect(x * cellSideLength, y * cellSideLength, cellSideLength, cellSideLength);
            }
        }
    }
};
main();
export {};
//# sourceMappingURL=fibonacci.js.map