//TODO: something like preact for dynamically re-rendering ui components

//! Utilities
type Coordinate = { x: number; y: number };
type Path = [Coordinate, Coordinate][];

const distance = (a: Coordinate, b: Coordinate) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const lerp = (a: number, b: number, percentage: number) => a * (1 - percentage) + b * percentage;
const lerpCoords = (a: Coordinate, b: Coordinate, amount: number) => ({
    x: lerp(a.x, b.x, amount),
    y: lerp(a.y, b.y, amount),
});

const isPointInRectangle = (point: Coordinate, topLeft: Coordinate, bottomRight: Coordinate) => {
    const { x: x1, y: y1 } = topLeft;
    const { x: x2, y: y2 } = bottomRight;
    const { x, y } = point;

    return x1 <= x && x2 >= x && y1 <= y && y2 >= y;
};

const removeAllChildNodes = (parent: Node) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

/**
 * computes the angle needed to point at a coordinate
 * https://stackoverflow.com/a/27481611/13996389
 * @param a the coordinate from which we are looking from
 * @param b the coordinate of a target
 */
const angleOf = (a: Coordinate, b: Coordinate) => {
    const deltaX = b.x - a.x;
    const deltaY = b.y - a.y;

    const angle = Math.atan2(deltaY, deltaX);

    return angle;
};

//! Bullet

class Bullet {
    initialPosition: Coordinate;
    angle: number;
    speed: number;
    startTime: number;
    touchedIds: number[];
    parent: Tower;
    damage: number;
    constructor(
        coordinate: Coordinate,
        angle: number,
        speed: number,
        startTime: number,
        parent: Tower
    ) {
        this.initialPosition = coordinate;
        this.angle = angle;
        this.speed = speed;
        this.startTime = startTime;
        this.touchedIds = [];
        this.parent = parent;
        this.damage = 1;
    }

    getPosition(time: number): Coordinate {
        const elapsedTime = time - this.startTime;
        let distance = elapsedTime * this.speed;
        return {
            x: this.initialPosition.x + distance * Math.cos(this.angle),
            y: this.initialPosition.y + distance * Math.sin(this.angle),
        };
    }
}

//! Enemies

class Enemy {
    /** The amount of units on screen to progress per second */
    speed: number;
    tickOffset: number;
    gameRadius: number;
    health: number;
    id: number;
    constructor(tickOffset = 0, id: number) {
        this.speed = 100;
        this.tickOffset = tickOffset;
        this.gameRadius = 20;
        this.health = 3;
        this.id = id;
    }

    getPositionInformation(
        time: number,
        path: Path,
        totalPathLength: number
    ): { location: Coordinate; percentOfTrackCovered: number } | undefined {
        const elapsedTime = time + this.tickOffset;

        if (elapsedTime < -this.gameRadius) {
            return;
        }

        const distanceTraveled = this.speed * elapsedTime;

        let cumulativeLength = 0;
        for (const lineSegment of path) {
            let currentLineLength = distance(...lineSegment);

            let previousCumulativeLength = cumulativeLength;
            cumulativeLength += currentLineLength;

            if (distanceTraveled < cumulativeLength) {
                // enemy is on this line segment
                let distanceTraveledOnCurrentSegment = distanceTraveled - previousCumulativeLength;
                let percentageOfPathTraveled = distanceTraveledOnCurrentSegment / currentLineLength;
                let pointOnLine = lerpCoords(...lineSegment, percentageOfPathTraveled);

                return {
                    location: pointOnLine,
                    percentOfTrackCovered: distanceTraveled / totalPathLength,
                };
            }
        }
    }

    get dead() {
        return this.health < 0;
    }
}

class SimpleEnemy extends Enemy {}

const GameEnemies: Enemy[] = [];

for (let i = 0; i < 10; i++) {
    GameEnemies.push(new SimpleEnemy(-i, i));
}

//! Towers

class Tower {
    range: number;
    location: Coordinate;
    maxTickCoolDown: number;
    tickCoolDown: number;
    id: number;
    pops: number;
    constructor(location: Coordinate, id: number) {
        this.range = 100;
        this.location = location;
        this.maxTickCoolDown = 1;
        this.tickCoolDown = 0;
        this.pops = 0;
        this.id = id;
    }

    getEnemiesInRange(time: number, enemies: Enemy[], path: Path, totalPathLength: number) {
        return enemies.filter((enemy) => {
            if (enemy.dead) return;

            const enemyPosition = enemy.getPositionInformation(time, path, totalPathLength);
            if (enemyPosition === undefined) return;
            const { location: enemyLocation } = enemyPosition;

            return distance(enemyLocation, this.location) <= this.range;
        });
    }

    targetEnemies(
        time: number,
        enemies: Enemy[],
        path: Path,
        totalPathLength: number
    ): Bullet[] | undefined {
        const enemiesInRange = this.getEnemiesInRange(time, enemies, path, totalPathLength);
        const closestEnemy = enemiesInRange[0];

        this.tickCoolDown--;
        if (this.tickCoolDown < 0) {
            this.tickCoolDown = this.maxTickCoolDown;
        }

        if (this.tickCoolDown !== 0) {
            return;
        }

        if (closestEnemy === undefined) return;

        const enemyPosition = closestEnemy.getPositionInformation(
            time,
            path,
            totalPathLength
        )?.location;

        if (enemyPosition === undefined) return;

        const enemyAngle = angleOf(this.location, enemyPosition);

        return [new Bullet(this.location, enemyAngle, 400, time, this)];
    }
}

class SimpleTower extends Tower {}

class MultiHitTower extends Tower {
    targetEnemies(
        time: number,
        enemies: Enemy[],
        path: Path,
        totalPathLength: number
    ): Bullet[] | undefined {
        this.tickCoolDown--;
        if (this.tickCoolDown < 0) {
            this.tickCoolDown = this.maxTickCoolDown;
        }

        if (this.tickCoolDown !== 0) {
            return;
        }

        const enemiesInRange = this.getEnemiesInRange(time, enemies, path, totalPathLength);

        if (enemiesInRange.length === 0) {
            return;
        }

        const amountOfBullets = 6;
        const fullCircle = Math.PI * 2;

        let bullets: Bullet[] = [];
        for (let i = 0; i < amountOfBullets; i++) {
            let bulletAngle = (fullCircle / amountOfBullets) * i;
            bullets.push(new Bullet(this.location, bulletAngle, 400, time, this));
        }

        return bullets;
    }
}

//! Game Manager

class Game {
    startTime: number;
    mouseCoords: Coordinate;

    uiContainer: HTMLDivElement;

    gameCanvas: HTMLCanvasElement;
    gameWidth: number;
    gameHeight: number;

    path: Path;
    totalPathLength: number;

    projectiles: Bullet[];
    towers: Tower[];
    selectedTower: Tower | undefined;

    constructor(
        gameCanvas: HTMLCanvasElement,
        uiContainer: HTMLDivElement,
        path: Path,
        startTime: number
    ) {
        this.startTime = startTime;

        this.mouseCoords = { x: 0, y: 0 };
        gameCanvas.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        this.uiContainer = uiContainer;

        this.gameCanvas = gameCanvas;
        this.gameWidth = gameCanvas.width;
        this.gameHeight = gameCanvas.height;

        this.path = path;
        this.totalPathLength = this.path.reduce((a, b) => a + distance(...b), 0);

        this.projectiles = [];
        this.towers = [
            new MultiHitTower({ x: 450, y: 200 }, 0),
            new SimpleTower({ x: 400, y: 250 }, 1),
        ];

        this.renderTowerUI(undefined);
        gameCanvas.addEventListener('click', () => {
            this.onClick();
        });
    }

    // runs every tick  for cleanup and stuff
    tick(time: number) {
        this.projectiles = this.projectiles.filter((bullet) =>
            isPointInRectangle(
                bullet.getPosition(time),
                { x: 0, y: 0 },
                { x: this.gameWidth, y: this.gameHeight }
            )
        );
    }

    async physics() {
        const time = (Date.now() - this.startTime) / 1000;

        this.tick(time);

        // collision
        for (const bullet of this.projectiles) {
            const bulletPosition = bullet.getPosition(time);

            for (const enemy of GameEnemies) {
                if (bullet.touchedIds.includes(enemy.id)) {
                    continue;
                }

                const enemyPosition = enemy.getPositionInformation(
                    time,
                    this.path,
                    this.totalPathLength
                );
                if (enemyPosition === undefined) continue;

                const dist = distance(bulletPosition, enemyPosition.location);

                if (dist <= enemy.gameRadius && !enemy.dead) {
                    // Only counts the pops that made the enemies health go to 0
                    bullet.parent.pops += Math.min(enemy.health, bullet.damage);
                    enemy.health -= bullet.damage;
                    bullet.touchedIds.push(enemy.id);
                }
            }
        }

        // targeting

        for (const tower of this.towers) {
            const bullets = tower.targetEnemies(time, GameEnemies, this.path, this.totalPathLength);

            if (bullets) {
                this.projectiles.push(...bullets);
            }
        }
    }

    async render() {
        const ctx = this.gameCanvas.getContext('2d');
        if (ctx === null) {
            throw new Error('unable to get context');
        }

        const frame = () => {
            const time = (Date.now() - this.startTime) / 1000;

            // clears the frame and reset to default
            ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

            // game field
            ctx.beginPath();
            ctx.fillStyle = '#bbb';
            ctx.rect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
            ctx.fill();
            ctx.stroke();

            // path

            for (const lineSegment of this.path) {
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(lineSegment[0].x, lineSegment[0].y);
                ctx.lineTo(lineSegment[1].x, lineSegment[1].y);
                ctx.stroke();

                // join lines at the end prettily
                ctx.lineWidth /= 2;
                ctx.beginPath();
                ctx.arc(lineSegment[1].x, lineSegment[1].y, ctx.lineWidth / 2, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.lineWidth = 1;

            // bullets
            for (const bullet of this.projectiles) {
                const position = bullet.getPosition(time);

                ctx.beginPath();
                ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'red';
                ctx.fill();
                ctx.fillStyle = 'black';
            }

            // enemies

            for (const enemy of GameEnemies) {
                if (enemy.dead) continue;

                const enemyPosition = enemy.getPositionInformation(
                    time,
                    this.path,
                    this.totalPathLength
                )?.location;

                if (enemyPosition === undefined) continue;

                ctx.beginPath();
                ctx.arc(enemyPosition.x, enemyPosition.y, enemy.gameRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'red';
                ctx.fill();

                ctx.fillStyle = 'black';
            }

            // towers
            let towerToDrawHighlight: Tower | undefined = this.selectedTower;
            for (const tower of this.towers) {
                ctx.beginPath();
                ctx.arc(tower.location.x, tower.location.y, 15, 0, Math.PI * 2);
                ctx.fillStyle = 'brown';
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = 'black';

                // 20 is the tower "hitbox"
                if (
                    distance(this.mouseCoords, tower.location) <= 20 &&
                    towerToDrawHighlight === undefined
                ) {
                    towerToDrawHighlight = tower;
                }
            }

            if (towerToDrawHighlight !== undefined) {
                ctx.beginPath();
                ctx.arc(
                    towerToDrawHighlight.location.x,
                    towerToDrawHighlight.location.y,
                    towerToDrawHighlight.range,
                    0,
                    Math.PI * 2
                );
                ctx.setLineDash([10, 10]);
                ctx.stroke();
                ctx.setLineDash([0]);
            }

            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    }

    renderTowerUI(tower: Tower | undefined) {
        removeAllChildNodes(this.uiContainer);

        if (tower === undefined) {
            this.uiContainer.innerText = 'No tower currently selected';
            return;
        }

        this.uiContainer.innerText = `Current selected tower: ${tower.pops}`;
    }

    onClick() {
        const closestTowers = this.towers.sort(
            (a, b) =>
                distance(this.mouseCoords, a.location) - distance(this.mouseCoords, b.location)
        );

        let currentSelectedTower: Tower | undefined;
        if (
            closestTowers.length >= 1 &&
            distance(closestTowers[0].location, this.mouseCoords) <= 20
        ) {
            currentSelectedTower = closestTowers[0];
        }

        if (this.selectedTower?.id !== currentSelectedTower?.id) {
            this.selectedTower = currentSelectedTower;
            this.renderTowerUI(currentSelectedTower);
        }
    }

    onMouseMove(e: MouseEvent) {
        this.mouseCoords.x = e.offsetX;
        this.mouseCoords.y = e.offsetY;
    }
}

const init = () => {
    const gameCanvas = document.querySelector('canvas');

    const uiContainer = <HTMLDivElement | null>document.getElementById('ui');

    if (gameCanvas === null || uiContainer === null) {
        console.error(`Error locating necessary html elements`, { gameCanvas, uiContainer });
        throw new Error();
    }

    const GAME_WIDTH = gameCanvas.width;
    const GAME_HEIGHT = gameCanvas.height;

    const path: Path = [
        [
            { x: 0, y: GAME_HEIGHT / 2 },
            { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
        ],
        [
            { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
            { x: GAME_WIDTH, y: 0 },
        ],
    ];
    const START_TIME = Date.now();
    const GAME = new Game(gameCanvas, uiContainer, path, START_TIME);

    setInterval(() => {
        GAME.physics();
    }, 100);
    GAME.render();
};

init();

export {};
