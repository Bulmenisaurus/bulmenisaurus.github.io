const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// utils
type Coordinate = { x: number; y: number };
type VertexArray = Coordinate[];
type EdgeArray = [Coordinate, Coordinate][];
type EdgeIndexArray = [number, number][];

const coordinateDistance = (a: Coordinate, b: Coordinate) =>
    Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const remove = <ItemType>(item: ItemType, arr: ItemType[]) => {
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
    async () => {
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

        const render = (d: number[]) => {
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

        const shuffle = async (array: number[]): Promise<number[]> => {
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
                await sleep(20);
            }

            return array;
        };

        const MergeSort = async (arr: Readonly<number[]>) => {
            const array = [...arr];

            const split = async (array: number[], idx1: number, idx2: number) => {
                if (idx2 == idx1) return;

                // splits the array into two halves, and recursively splits and sorts each
                const middle = Math.floor((idx1 + idx2) / 2);
                await split(array, idx1, middle);
                await split(array, middle + 1, idx2);

                await merge(array, idx1, middle, middle + 1, idx2);

                render(array);
                await sleep(20);
            };

            const merge = async (arr: number[], i1: number, i2: number, j1: number, j2: number) => {
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
                    } else if (j >= partition2.length) {
                        // all elements of the second partition are used up
                        arr[k] = partition1[i];
                        i++;
                    } else if (partition1[i] < partition2[j]) {
                        // otherwise, take the smallest element of the two
                        arr[k] = partition1[i];
                        i++;
                    } else {
                        arr[k] = partition2[j];
                        j++;
                    }
                    render(array);
                    await sleep(20);
                }

                // await draw(arr, ctx);
            };

            await split(array, 0, array.length - 1);
        };

        await sleep(100);

        while (true) {
            const indices = await shuffle(data.map((_, idx) => idx));

            await sleep(1000);
            await MergeSort(indices);
            await sleep(2000);
        }
    },
    () => {
        const loadingContainer = document.createElement('div');

        const loadingText = document.createElement('div');
        loadingText.classList.add('text-loading');
        loadingText.innerText = 'Loading:\n\n';

        loadingContainer.appendChild(loadingText);

        const textLoadingBar = (element: HTMLElement) => {
            const drawPercent = (percentFull: number = 100) => {
                const content = '='.repeat(Math.round(percentFull / 5));
                const percentText = Math.round(percentFull).toString().padStart(3, ' ');
                element.innerText = `[${content.padEnd(20, ' ')}] ${percentText}%`;
            };

            return { draw: drawPercent };
        };

        const drawFunctions: ((percentFull: number) => void)[] = [];

        for (let i = 0; i < 10; i++) {
            const loadingBar = document.createElement('div');
            loadingBar.classList.add('text-loading-bar');
            const { draw } = textLoadingBar(loadingBar);

            loadingContainer.appendChild(loadingBar);

            drawFunctions.push(draw);
        }

        const normalizedSin = (n: number) => {
            return ((Math.sin(n) + 1) / 2) * 100;
        };

        document.body.appendChild(loadingContainer);

        const render = (t: number) => {
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
    async () => {
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

        const vertices: VertexArray = [];

        const pad = Math.min(canvas.width, canvas.height) * (1 / 100);

        for (let i = 0; i < VERTICES_AMOUNT; i++) {
            const x = Math.floor(Math.random() * (canvas.width - pad)) + pad / 2;
            const y = Math.floor(Math.random() * (canvas.height - pad)) + pad / 2;
            vertices.push({ x, y });
        }

        // TSP algorithms

        const closestVertexAlgorithm = async (
            v: VertexArray,
            draw: (edges: EdgeArray) => Promise<void>
        ) => {
            const edges: EdgeArray = [];

            const visitedVertices: number[] = [];
            let previousVertexIdx = 0;
            for (let i = 0; i < v.length - 1; i++) {
                visitedVertices.push(previousVertexIdx);
                const currentVertex = v[previousVertexIdx];

                const unvisitedVertices = v
                    .map((_, idx) => idx)
                    .filter((idx) => !visitedVertices.includes(idx));

                const closestVertex = unvisitedVertices.sort(
                    (a, b) =>
                        coordinateDistance(currentVertex, v[a]) -
                        coordinateDistance(currentVertex, v[b])
                )[0];

                edges.push([currentVertex, v[closestVertex]]);

                await draw(edges);

                visitedVertices.push(closestVertex);
                previousVertexIdx = closestVertex;
            }

            edges.push([v[0], v[previousVertexIdx]]);
            await draw(edges);

            return edges;
        };

        const rotateAlgorithm = async (v: VertexArray, draw: (e: EdgeArray) => Promise<void>) => {
            const edges: EdgeArray = [];

            // average x and y coordinate
            const referencePointX = v.reduce((a, b) => a + b.x, 0) / v.length;
            const referencePointY = v.reduce((a, b) => a + b.y, 0) / v.length;

            const angleAround = (point: Coordinate) => {
                const normX = point.x - referencePointX;
                const normY = point.y - referencePointY;

                return Math.atan2(normY, normX);
            };

            const orderedPoints = v.sort((a, b) => angleAround(a) - angleAround(b));

            for (let i = 0; i < orderedPoints.length - 1; i++) {
                edges.push([orderedPoints[i], orderedPoints[i + 1]]);
                await draw(edges);
            }

            edges.push([orderedPoints[0], orderedPoints[orderedPoints.length - 1]]);
            await draw(edges);

            return edges;
        };

        //TODO: finish
        const christofidesAlgorithm = async (
            v: VertexArray,
            draw: (e: EdgeArray, v?: Coordinate[]) => Promise<void>
        ) => {
            // Minimum spanning tree
            const generateMST = async (vertices: VertexArray): Promise<EdgeIndexArray> => {
                let edges: EdgeArray = [];
                let edgeIndices: EdgeIndexArray = [];
                let visitedVertices: number[] = [0];
                let unvisitedVertices: number[] = vertices.map((_, idx) => idx);

                remove(0, unvisitedVertices);

                for (let i = 0; i < vertices.length - 1; i++) {
                    let minCost: number | undefined;
                    let minCostVertices: [number, number] | undefined;

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
                    await draw(edges);
                }

                return edgeIndices;
            };

            const perfectMatching = async (edges: EdgeIndexArray): Promise<EdgeArray> => {
                const vertexCounts = new Map<number, number>();
                const oddDegreeVertices: number[] = [];

                for (const edge of edges.flat()) {
                    if (vertexCounts.has(edge)) {
                        vertexCounts.set(edge, vertexCounts.get(edge)! + 1);
                    } else {
                        vertexCounts.set(edge, 1);
                    }
                }

                for (const [vertex, amount] of vertexCounts) {
                    if (amount % 2 === 1) {
                        oddDegreeVertices.push(vertex);
                    }
                }

                await draw(
                    edges.map((e) => [v[e[0]], v[e[1]]]),
                    oddDegreeVertices.map((m) => vertices[m])
                );

                return [];
            };

            const mst = await generateMST(v);
            const match = await perfectMatching(mst);
        };

        ctx.strokeStyle = 'rgb(0, 150, 200)';
        ctx.lineWidth = 2;
        const draw = async (edges: EdgeArray, v?: Coordinate[]) => {
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

            await sleep(3_000 / VERTICES_AMOUNT);
        };

        const algorithms = [closestVertexAlgorithm, rotateAlgorithm];
        const randomAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];

        const path = await randomAlgorithm(vertices, draw);

        ctx.fillStyle = 'rgb(200, 200, 200)';
    },
    async () => {
        const canvas = document.createElement('canvas');
        canvas.classList.add('voroni');

        const ctx = canvas.getContext('2d');

        if (ctx === null) {
            throw new Error('CTX is null');
        }

        const size = 500;
        canvas.width = canvas.height = size;

        document.body.appendChild(canvas);

        type ColoredPoint = Coordinate & {
            color: string;
        };

        const points: ColoredPoint[] = [];

        const POINTS_AMOUNT = 50;

        // expressed as a percentage (50 is max)
        let pad = 5 / 100;
        for (let i = 0; i < POINTS_AMOUNT; i++) {
            const x = (Math.random() * (1 - 2 * pad) + pad) * size;
            const y = (Math.random() * (1 - 2 * pad) + pad) * size;

            const hue = Math.floor(360 * (i / POINTS_AMOUNT));
            points.push({ x, y, color: `hsl(${hue} 70% 74%)` });
        }

        const manhattanDistance = (a: Coordinate, b: Coordinate) => {
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
    },
    async () => {
        const canvas = document.createElement('canvas');
        let size = 1000;
        canvas.width = canvas.height = size;
        canvas.classList.add('triangulation');
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ``;
        if (ctx === null) {
            throw new Error('error getting context');
        }

        type Polygon = Coordinate[];

        const shuffle = <ItemType>(array: ItemType[], seed?: number): ItemType[] => {
            let currentIndex = array.length;
            let randomIndex = -1;

            const normalizedSin = (n: number) => (Math.sin(n) + 1) / 2;

            // While there remain elements to shuffle.
            while (currentIndex != 0) {
                // Pick a remaining element.
                if (seed === undefined) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                } else {
                    randomIndex = Math.floor(
                        normalizedSin(seed * (currentIndex + 7)) * currentIndex
                    );
                }
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex],
                    array[currentIndex],
                ];
            }

            return array;
        };

        const generateConvexPolygon = (nPoints: number): Polygon => {
            // https://cglab.ca/~sander/misc/ConvexGeneration/convex.html
            let xPool: number[] = [];
            let yPool: number[] = [];

            for (let i = 0; i < nPoints; i++) {
                xPool.push(Math.random());
                yPool.push(Math.random());
            }

            xPool = xPool.sort((a, b) => a - b);
            yPool = yPool.sort((a, b) => a - b);

            const minX = xPool[0];
            const maxX = xPool[nPoints - 1];
            const minY = yPool[0];
            const maxY = yPool[nPoints - 1];

            let xVectors: number[] = [];
            let yVectors: number[] = [];

            let lastTop = minX;
            let lastBottom = minX;

            for (let i = 1; i < nPoints - 1; i++) {
                let x = xPool[i];

                if (Math.random() > 0.5) {
                    xVectors.push(x - lastTop);
                    lastTop = x;
                } else {
                    xVectors.push(lastBottom - x);
                    lastBottom = x;
                }
            }

            xVectors.push(maxX - lastTop);
            xVectors.push(lastBottom - maxX);

            let lastLeft = minY;
            let lastRight = minY;

            for (let i = 1; i < nPoints - 1; i++) {
                let y = yPool[i];

                if (Math.random() > 0.5) {
                    yVectors.push(y - lastLeft);
                    lastLeft = y;
                } else {
                    yVectors.push(lastRight - y);
                    lastRight = y;
                }
            }

            yVectors.push(maxY - lastLeft);
            yVectors.push(lastRight - maxY);

            yVectors = shuffle(yVectors);

            let vectors: [number, number][] = [];

            for (let i = 0; i < nPoints; i++) {
                vectors.push([xVectors[i], yVectors[i]]);
            }

            vectors = vectors.sort((a, b) => {
                let angleA = Math.atan2(...a);
                let angleB = Math.atan2(...b);

                return angleA - angleB;
            });

            let x = 0;
            let y = 0;
            let minPolygonX = 0;
            let minPolygonY = 0;
            let points: Coordinate[] = [];

            for (let i = 0; i < nPoints; i++) {
                points.push({ x, y });

                x += vectors[i][0];
                y += vectors[i][1];

                minPolygonX = Math.min(minPolygonX, x);
                minPolygonY = Math.min(minPolygonY, y);
            }

            let xShift = minX - minPolygonX;
            let yShift = minY - minPolygonY;

            for (let i = 0; i < nPoints; i++) {
                let p = points[i];

                points[i] = { x: p.x + xShift, y: p.y + yShift };
            }

            return points;
        };

        const triangulateConvexPolygon = (polygon: Polygon): Polygon[] => {
            if (polygon.length === 3) {
                return triangulateTriangle(polygon);
            }

            let triangles: Polygon[] = [];
            // connect everysingle vertex to the 0th vertex
            for (let i = 1; i < polygon.length - 1; i++) {
                const points = [polygon[0], polygon[i], polygon[i + 1]];
                triangles.push(shuffle(points));
            }

            return shuffle(triangles);
        };

        /**
         * Finds the centroid of the triangle, and finds the three triangles by connecting this centroid
         * to the three vertices of a triangle.
         * Source: http://jwilson.coe.uga.edu/emt668/EMAT6680.2000/Lehman/emat6690/trisecttri%27s/whywork.html
         */
        const triangulateTriangle = (polygon: Polygon): Polygon[] => {
            const centroid = {
                x: (polygon[0].x + polygon[1].x + polygon[2].x) / 3,
                y: (polygon[0].y + polygon[1].y + polygon[2].y) / 3,
            };

            const p1 = [polygon[0], polygon[1], centroid];
            const p2 = [polygon[1], polygon[2], centroid];
            const p3 = [polygon[2], polygon[0], centroid];

            return [p1, p2, p3];
        };

        const isPointInTriangle = (point: Coordinate, triangle: Polygon) => {
            // https://stackoverflow.com/a/2049593/13996389
            const sign = (p1: Coordinate, p2: Coordinate, p3: Coordinate) => {
                return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
            };

            const d1 = sign(point, triangle[0], triangle[1]);
            const d2 = sign(point, triangle[1], triangle[2]);
            const d3 = sign(point, triangle[2], triangle[0]);

            const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
            const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

            return !(has_neg && has_pos);
        };

        const drawPolygon = (polygon: Polygon, fillColor?: string, stroke?: boolean) => {
            ctx.moveTo(polygon[0].x * size, polygon[0].y * size);
            ctx.beginPath();
            for (let i = 0; i < polygon.length; i++) {
                ctx.lineTo(polygon[i].x * size, polygon[i].y * size);
            }
            ctx.lineTo(polygon[0].x * size, polygon[0].y * size);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            if (stroke) ctx.stroke();

            if (fillColor !== undefined) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }
        };

        let scaleUp = (polygon: Polygon, amount: number) => {
            return polygon.map(({ x, y }) => ({
                x: x * amount,
                y: y * amount,
            }));
        };

        const recursiveTriangulation = (
            triangulation: Polygon[],
            point: Coordinate,
            depth: number,
            gradientColor: string[]
        ) => {
            const activeTriangle = triangulation.find((tri) =>
                isPointInTriangle(point, scaleUp(tri, size))
            );

            if (activeTriangle === undefined) {
                return;
            }

            if (depth <= gradientColor.length - 1) {
                drawPolygon(activeTriangle, gradientColor[depth]);
            }

            if (depth <= 0) {
                return;
            }

            triangulation.forEach((p) => drawPolygon(p));

            recursiveTriangulation(
                triangulateTriangle(activeTriangle),
                point,
                depth - 1,
                gradientColor
            );
        };

        const main = () => {
            const polygon = generateConvexPolygon(6);
            const triangulation = triangulateConvexPolygon(polygon);

            drawPolygon(polygon, undefined, true);

            const purpleGradient = [
                'rgb(50, 0, 100)',
                'rgb(100, 0, 100)',
                'rgb(175, 20, 130)',
                'rgb(200, 40, 140)',
                'rgb(230, 100, 150)',
                'rgb(250, 150, 170)',
            ];

            const hotGradient = ['#E24125', '#E5612A', '#E8812F', '#ECA035', '#EFC03A', '#F2E03F'];

            const linear_bmy = ['#f5f84d', '#fcb237', '#f76157', '#c40e82', '#5e1692'];

            const gradientColors = [purpleGradient, hotGradient, linear_bmy];
            const gradientColor = gradientColors[Math.floor(gradientColors.length * Math.random())];

            canvas.addEventListener('mousemove', (e) => {
                const screenSize = canvas.clientHeight;
                const resolution = size / screenSize;

                const x = e.offsetX * resolution;
                const y = e.offsetY * resolution;

                ctx.clearRect(0, 0, size, size);

                drawPolygon(polygon, undefined, true);
                recursiveTriangulation(triangulation, { x, y }, 4, gradientColor);
            });
        };

        main();
    },
];

const LSLastLoadingBar = localStorage.getItem('last-loading-bar');

let lastLoadingBar: number | undefined;

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

loadingBars[theme]();
localStorage.setItem('last-loading-bar', theme.toString());

export {};
