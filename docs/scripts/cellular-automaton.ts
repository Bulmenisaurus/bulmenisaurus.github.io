type CanvasCell = number;
type CanvasGrid = CanvasCell[];
type CTX = CanvasRenderingContext2D;

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const drawGrid = (
    ctx: CTX,
    grid: CanvasGrid,
    gridWidth: number,
    pixelWidth: number,
    pixelHeight: number
) => {
    const gridHeight = grid.length / gridWidth;

    for (let i = 0; i < gridHeight; i++) {
        drawRow(ctx, grid, i, gridWidth, pixelWidth, pixelHeight);
    }
};

const drawRow = (
    ctx: CTX,
    grid: CanvasGrid,
    rowIdx: number,
    gridWidth: number,
    pixelWidth: number,
    pixelHeight: number
) => {
    const gridHeight = grid.length / gridWidth;

    const cellPixelWidth = pixelWidth / gridWidth;
    const cellPixelHeight = pixelHeight / gridHeight;

    let rowStartIdx = gridWidth * rowIdx;

    for (let i = rowStartIdx; i < rowStartIdx + gridWidth; i++) {
        ctx.fillStyle = ['white', 'black', 'blue'][grid[i]];

        let x = i % gridWidth;
        let y = rowIdx;

        ctx.beginPath();
        ctx.rect(x * cellPixelWidth, y * cellPixelHeight, cellPixelWidth, cellPixelHeight);
        ctx.fill();
    }
};

const updateRow = (g: Readonly<CanvasGrid>, rowIdx: number, width: number, ruleIdx: number) => {
    const grid = [...g];

    let previousRow = rowIdx - 1;
    let startRowIdx = width * previousRow;
    for (let i = 1; i <= width - 2; i++) {
        let previousRowValue =
            grid[startRowIdx + i - 1] * 2 ** 2 +
            grid[startRowIdx + i + 0] * 2 ** 1 +
            grid[startRowIdx + i + 1] * 2 ** 0;

        if (grid[startRowIdx + i + 1] === undefined) {
            console.error('is undefined!!!');
        }

        let cellValue = (ruleIdx & (2 ** previousRowValue)) >= 1 ? 1 : 0;

        grid[width * rowIdx + i] = cellValue;
    }

    return grid;
};

const main = async (height: number, rule: number) => {
    const canvas = document.createElement('canvas');

    const canvasSimulationHeight = height;
    const canvasSimulationWidth = 1 + 2 * canvasSimulationHeight;

    const canvasRenderHeight = canvasSimulationHeight * 5;
    const canvasRenderWidth = canvasSimulationWidth * 5;

    canvas.width = canvasRenderWidth;
    canvas.height = canvasRenderHeight;

    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    if (ctx === null) {
        throw new Error('unable to get ctx');
    }

    let grid: number[] = [];
    for (let i = 0; i < canvasSimulationHeight * canvasSimulationWidth; i++) {
        grid.push(0);
    }

    grid[(canvasSimulationWidth - 1) / 2] = 1;
    drawGrid(ctx, grid, canvasSimulationWidth, canvasRenderWidth, canvasRenderHeight);

    for (let i = 1; i < canvasSimulationHeight; i++) {
        grid = updateRow(grid, i, canvasSimulationWidth, rule);
        drawRow(ctx, grid, i, canvasSimulationWidth, canvasRenderWidth, canvasRenderHeight);
        await sleep(0);
    }
};

main(400, 90);

export {};
