var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
const coordinateDistance = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
const remove = (item, arr) => {
    const itemIdx = arr.indexOf(item);
    if (itemIdx === -1) {
        return;
    }
    arr.splice(itemIdx, 1);
};
const loadingBars = [
    () => {
        const loadingContainer = document.createElement('div');
        loadingContainer.classList.add('loading-container');
        const loadingText = document.createElement('div');
        loadingText.classList.add('loading-text');
        loadingText.innerText = 'LOADING';
        const loadingBar = document.createElement('div');
        loadingBar.classList.add('loading-bar');
        loadingContainer.append(loadingText, loadingBar);
        document.body.appendChild(loadingContainer);
    },
    () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.classList.add('dark');
        const loadingCanvas = document.createElement('canvas');
        loadingCanvas.classList.add('sorting');
        document.body.appendChild(loadingCanvas);
        loadingCanvas.width = 33 * 75;
        loadingCanvas.height = 5 * 75;
        const ctx = loadingCanvas.getContext('2d');
        if (ctx === null) {
            throw new Error('CTX is broken');
        }
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, loadingCanvas.width, loadingCanvas.height);
        const data = [
            31, 1, 1, 1, 0, 31, 17, 17, 31, 0, 15, 20, 20, 15, 0, 31, 17, 17, 14, 0, 17, 31, 17, 0,
            31, 8, 4, 31, 0, 31, 17, 21, 23,
        ];
        const render = (d) => {
            for (const [column_idx, c] of d.entries()) {
                for (let row_idx = 0; row_idx <= 5; row_idx++) {
                    const column = data[c];
                    ctx.fillStyle = (column & (1 << row_idx)) == 0 ? 'black' : 'white';
                    ctx.beginPath();
                    ctx.rect(column_idx * 75, (4 - row_idx) * 75, 75, 75);
                    ctx.fill();
                }
            }
        };
        const shuffle = (array) => __awaiter(void 0, void 0, void 0, function* () {
            let currentIndex = array.length;
            let randomIndex = -1;
            // While there remain elements to shuffle.
            while (currentIndex != 0) {
                // Pick a remaining element.
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex],
                    array[currentIndex],
                ];
                render(array);
                yield sleep(20);
            }
            return array;
        });
        const MergeSort = (arr) => __awaiter(void 0, void 0, void 0, function* () {
            const array = [...arr];
            const split = (array, idx1, idx2) => __awaiter(void 0, void 0, void 0, function* () {
                if (idx2 == idx1)
                    return;
                // splits the array into two halves, and recursively splits and sorts each
                const middle = Math.floor((idx1 + idx2) / 2);
                yield split(array, idx1, middle);
                yield split(array, middle + 1, idx2);
                yield merge(array, idx1, middle, middle + 1, idx2);
                render(array);
                yield sleep(20);
            });
            const merge = (arr, i1, i2, j1, j2) => __awaiter(void 0, void 0, void 0, function* () {
                // takes two sorted partitions at indexes i1-i2 and j1-j2, and combines them at i1-j2
                const partition1 = arr.slice(i1, i2 + 1);
                const partition2 = arr.slice(j1, j2 + 1);
                let i = 0;
                let j = 0;
                let k = i1;
                for (; k <= j2; k++) {
                    // all the elements of the first partition are used up, that means the elements of partition 2 are all larger and can be inserted
                    if (i >= partition1.length) {
                        arr[k] = partition2[j];
                        j++;
                    }
                    else if (j >= partition2.length) {
                        // all elements of the second partition are used up
                        arr[k] = partition1[i];
                        i++;
                    }
                    else if (partition1[i] < partition2[j]) {
                        // otherwise, take the smallest element of the two
                        arr[k] = partition1[i];
                        i++;
                    }
                    else {
                        arr[k] = partition2[j];
                        j++;
                    }
                    render(array);
                    yield sleep(20);
                }
                // await draw(arr, ctx);
            });
            yield split(array, 0, array.length - 1);
        });
        yield sleep(100);
        while (true) {
            const indices = yield shuffle(data.map((_, idx) => idx));
            yield sleep(1000);
            yield MergeSort(indices);
            yield sleep(2000);
        }
    }),
    () => {
        const loadingContainer = document.createElement('div');
        const loadingText = document.createElement('div');
        loadingText.classList.add('text-loading');
        loadingText.innerText = 'Loading:\n\n';
        loadingContainer.appendChild(loadingText);
        const textLoadingBar = (element) => {
            const drawPercent = (percentFull = 100) => {
                const content = '='.repeat(Math.round(percentFull / 5));
                const percentText = Math.round(percentFull).toString().padStart(3, ' ');
                element.innerText = `[${content.padEnd(20, ' ')}] ${percentText}%`;
            };
            return { draw: drawPercent };
        };
        const drawFunctions = [];
        for (let i = 0; i < 10; i++) {
            const loadingBar = document.createElement('div');
            loadingBar.classList.add('text-loading-bar');
            const { draw } = textLoadingBar(loadingBar);
            loadingContainer.appendChild(loadingBar);
            drawFunctions.push(draw);
        }
        const normalizedSin = (n) => {
            return ((Math.sin(n) + 1) / 2) * 100;
        };
        document.body.appendChild(loadingContainer);
        const render = (t) => {
            const time = t / 1000;
            drawFunctions.forEach((draw, idx) => {
                const randomOffset = (idx * 27) % 10;
                draw(normalizedSin(time + randomOffset));
            });
            window.requestAnimationFrame((t) => render(t));
        };
        window.requestAnimationFrame((t) => render(t));
    },
    // () => {
    //     const canvas = document.createElement('canvas');
    //     canvas.height = 1000;
    //     canvas.width = 1000;
    //     const ctx = canvas.getContext('2d');
    //     if (ctx === null) {
    //         throw new Error('context is null');
    //     }
    //     const simulationWidth = 10;
    //     const simulationHeight = 10;
    //     type Cell = 0 | 1;
    //     type CellMatrix = Cell[][];
    //     const createMatrix = <ItemType>(x: number, y: number, i: () => ItemType): ItemType[][] => {
    //         return Array(simulationWidth)
    //             .fill([])
    //             .map(() => Array(simulationHeight).fill(0).map(i));
    //     };
    //     const mod = (n: number, d: number) => {
    //         return ((n % d) + d) % d;
    //     };
    //     const getCell = (m: CellMatrix, x: number, y: number) => {
    //         return m[mod(x, simulationWidth)][mod(y, simulationHeight)];
    //     };
    //     const getNeighbors = (m: CellMatrix, x: number, y: number): Cell[] => {
    //         const neighbors = [
    //             getCell(m, x, y + 1),
    //             getCell(m, x + 1, y + 1),
    //             getCell(m, x + 1, y),
    //             getCell(m, x + 1, y - 1),
    //             getCell(m, x, y - 1),
    //             getCell(m, x - 1, y - 1),
    //             getCell(m, x - 1, y),
    //             getCell(m, x - 1, y + 1),
    //         ];
    //         return neighbors;
    //     };
    //     const renderMatrix = (ctx: CanvasRenderingContext2D, m: CellMatrix) => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);
    //         ctx.fillStyle = 'black';
    //         const tileWidth = canvas.width / simulationWidth;
    //         const tileHeight = canvas.height / simulationHeight;
    //         for (let x = 0; x < simulationWidth; x++) {
    //             for (let y = 0; y < simulationHeight; y++) {
    //                 const cell = getCell(m, x, y);
    //                 if (cell === 1) {
    //                     ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
    //                 }
    //             }
    //         }
    //     };
    //     let simulation = createMatrix<Cell>(
    //         simulationWidth,
    //         simulationHeight,
    //         () => <Cell>(Math.random() > 0.5 ? 1 : 0)
    //     );
    //     const draw = async () => {
    //         while (true) {
    //             const newMatrix = createMatrix<Cell>(simulationWidth, simulationHeight, () => 0);
    //             for (let x = 0; x < simulationWidth; x++) {
    //                 for (let y = 0; y < simulationHeight; y++) {
    //                     const neighbors = getNeighbors(simulation, x, y).reduce<number>(
    //                         (a, b) => a + b,
    //                         0
    //                     );
    //                     const self = getCell(simulation, x, y);
    //                     // if (self === 1) {
    //                     //     newMatrix[x][y] = neighbors < 2 || neighbors > 4 ? 0 : 1;
    //                     // } else {
    //                     //     newMatrix[x][y] = neighbors === 3 ? 1 : 0;
    //                     // }
    //                     newMatrix[x][y] = neighbors > 3 && neighbors != 7 ? 1 : 0;
    //                 }
    //             }
    //             simulation = newMatrix;
    //             renderMatrix(ctx, simulation);
    //             await sleep(100);
    //         }
    //     };
    //     draw();
    //     document.body.appendChild(canvas);
    // },
    () => __awaiter(void 0, void 0, void 0, function* () {
        const VERTICES_AMOUNT = 100;
        document.body.classList.add('dark');
        const canvas = document.createElement('canvas');
        canvas.classList.add('graph');
        canvas.width = 2000;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('ctx is null');
        }
        document.body.appendChild(canvas);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const vertices = [];
        const pad = Math.min(canvas.width, canvas.height) * (1 / 100);
        for (let i = 0; i < VERTICES_AMOUNT; i++) {
            const x = Math.floor(Math.random() * (canvas.width - pad)) + pad / 2;
            const y = Math.floor(Math.random() * (canvas.height - pad)) + pad / 2;
            vertices.push({ x, y });
        }
        // TSP algorithms
        const closestVertexAlgorithm = (v, draw) => __awaiter(void 0, void 0, void 0, function* () {
            const edges = [];
            const visitedVertices = [];
            let previousVertexIdx = 0;
            for (let i = 0; i < v.length - 1; i++) {
                visitedVertices.push(previousVertexIdx);
                const currentVertex = v[previousVertexIdx];
                const unvisitedVertices = v
                    .map((_, idx) => idx)
                    .filter((idx) => !visitedVertices.includes(idx));
                const closestVertex = unvisitedVertices.sort((a, b) => coordinateDistance(currentVertex, v[a]) -
                    coordinateDistance(currentVertex, v[b]))[0];
                edges.push([currentVertex, v[closestVertex]]);
                yield draw(edges);
                visitedVertices.push(closestVertex);
                previousVertexIdx = closestVertex;
            }
            edges.push([v[0], v[previousVertexIdx]]);
            yield draw(edges);
            return edges;
        });
        const rotateAlgorithm = (v, draw) => __awaiter(void 0, void 0, void 0, function* () {
            const edges = [];
            // average x and y coordinate
            const referencePointX = v.reduce((a, b) => a + b.x, 0) / v.length;
            const referencePointY = v.reduce((a, b) => a + b.y, 0) / v.length;
            const angleAround = (point) => {
                const normX = point.x - referencePointX;
                const normY = point.y - referencePointY;
                return Math.atan2(normY, normX);
            };
            const orderedPoints = v.sort((a, b) => angleAround(a) - angleAround(b));
            for (let i = 0; i < orderedPoints.length - 1; i++) {
                edges.push([orderedPoints[i], orderedPoints[i + 1]]);
                yield draw(edges);
            }
            edges.push([orderedPoints[0], orderedPoints[orderedPoints.length - 1]]);
            yield draw(edges);
            return edges;
        });
        //TODO: finish
        const christofidesAlgorithm = (v, draw) => __awaiter(void 0, void 0, void 0, function* () {
            // Minimum spanning tree
            const generateMST = (vertices) => __awaiter(void 0, void 0, void 0, function* () {
                let edges = [];
                let edgeIndices = [];
                let visitedVertices = [0];
                let unvisitedVertices = vertices.map((_, idx) => idx);
                remove(0, unvisitedVertices);
                for (let i = 0; i < vertices.length - 1; i++) {
                    let minCost;
                    let minCostVertices;
                    visitedVertices.forEach((v) => {
                        unvisitedVertices.forEach((u) => {
                            const cost = coordinateDistance(vertices[u], vertices[v]);
                            if (minCost === undefined || cost < minCost) {
                                minCost = cost;
                                minCostVertices = [v, u];
                            }
                        });
                    });
                    if (minCost === undefined || minCostVertices === undefined) {
                        console.error('Mincost is undefined');
                        continue;
                    }
                    // second is unvisited
                    const [a, b] = minCostVertices;
                    remove(b, unvisitedVertices);
                    visitedVertices.push(b);
                    edges.push([vertices[a], vertices[b]]);
                    edgeIndices.push([a, b]);
                    yield draw(edges);
                }
                return edgeIndices;
            });
            const perfectMatching = (edges) => __awaiter(void 0, void 0, void 0, function* () {
                const vertexCounts = new Map();
                const oddDegreeVertices = [];
                for (const edge of edges.flat()) {
                    if (vertexCounts.has(edge)) {
                        vertexCounts.set(edge, vertexCounts.get(edge) + 1);
                    }
                    else {
                        vertexCounts.set(edge, 1);
                    }
                }
                for (const [vertex, amount] of vertexCounts) {
                    if (amount % 2 === 1) {
                        oddDegreeVertices.push(vertex);
                    }
                }
                yield draw(edges.map((e) => [v[e[0]], v[e[1]]]), oddDegreeVertices.map((m) => vertices[m]));
                return [];
            });
            const mst = yield generateMST(v);
            const match = yield perfectMatching(mst);
        });
        ctx.strokeStyle = 'rgb(0, 150, 200)';
        ctx.lineWidth = 2;
        const draw = (edges, v) => __awaiter(void 0, void 0, void 0, function* () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            for (const edge of edges) {
                ctx.moveTo(edge[0].x, edge[0].y);
                ctx.lineTo(edge[1].x, edge[1].y);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgb(220, 220, 220)';
            vertices.forEach((v) => {
                ctx.beginPath();
                ctx.arc(v.x, v.y, 10, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = 'rgb(150, 0, 200)';
            (v || []).forEach((c) => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
                ctx.fill();
            });
            yield sleep(3000 / VERTICES_AMOUNT);
        });
        const algorithms = [closestVertexAlgorithm, rotateAlgorithm];
        const randomAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
        const path = yield randomAlgorithm(vertices, draw);
        ctx.fillStyle = 'rgb(200, 200, 200)';
    }),
    () => __awaiter(void 0, void 0, void 0, function* () {
        const canvas = document.createElement('canvas');
        canvas.classList.add('voroni');
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('CTX is null');
        }
        const size = 500;
        canvas.width = canvas.height = size;
        document.body.appendChild(canvas);
        const points = [];
        const POINTS_AMOUNT = 50;
        // expressed as a percentage (50 is max)
        let pad = 5 / 100;
        for (let i = 0; i < POINTS_AMOUNT; i++) {
            const x = (Math.random() * (1 - 2 * pad) + pad) * size;
            const y = (Math.random() * (1 - 2 * pad) + pad) * size;
            const hue = Math.floor(360 * (i / POINTS_AMOUNT));
            points.push({ x, y, color: `hsl(${hue} 70% 74%)` });
        }
        const manhattanDistance = (a, b) => {
            let p = 1;
            return (Math.abs(a.x - b.x) ** p + Math.abs(a.y - b.y) ** p) ** (1 / p);
        };
        const euclideanDistance = coordinateDistance;
        const startTime = Date.now();
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const s = [manhattanDistance][(x + y) % 1];
                let closestPoint = points[0];
                let closestPointDistance = s({ x, y }, closestPoint);
                // better than .sort()
                for (const point of points) {
                    let distance = s({ x, y }, point);
                    if (distance < closestPointDistance) {
                        closestPoint = point;
                        closestPointDistance = distance;
                    }
                }
                ctx.fillStyle = closestPoint.color;
                ctx.beginPath();
                ctx.rect(x, y, 1, 1);
                ctx.fill();
            }
        }
        console.log(`Took ${Date.now() - startTime}ms to compute voroni`);
    }),
];
const LSLastLoadingBar = localStorage.getItem('last-loading-bar');
let lastLoadingBar;
if (LSLastLoadingBar !== null && !isNaN(parseInt(LSLastLoadingBar))) {
    lastLoadingBar = parseInt(LSLastLoadingBar);
}
const urlParams = new URLSearchParams(window.location.search);
const loadingBar = urlParams.get('l');
let theme = -1;
while (theme === lastLoadingBar || theme === -1) {
    theme = Math.floor(Math.random() * loadingBars.length);
}
if (loadingBar !== null) {
    const parsed = parseInt(loadingBar);
    if (!isNaN(parsed)) {
        theme = parsed;
    }
}
loadingBars[4]();
localStorage.setItem('last-loading-bar', theme.toString());
export {};
//# sourceMappingURL=script.js.map