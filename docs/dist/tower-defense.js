var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const distance = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
const lerp = (a, b, percentage) => a * (1 - percentage) + b * percentage;
const lerpCoords = (a, b, amount) => ({
    x: lerp(a.x, b.x, amount),
    y: lerp(a.y, b.y, amount),
});
const isPointInRectangle = (point, topLeft, bottomRight) => {
    const { x: x1, y: y1 } = topLeft;
    const { x: x2, y: y2 } = bottomRight;
    const { x, y } = point;
    return x1 <= x && x2 >= x && y1 <= y && y2 >= y;
};
/**
 * computes the angle needed to point at a coordinate
 * https://stackoverflow.com/a/27481611/13996389
 * @param a the coordinate from which we are looking from
 * @param b the coordinate of a target
 */
const angleOf = (a, b) => {
    const deltaX = b.x - a.x;
    const deltaY = b.y - a.y;
    const angle = Math.atan2(deltaY, deltaX);
    return angle;
};
//! Bullet
class Bullet {
    constructor(coordinate, angle, speed, startTime) {
        this.initialPosition = coordinate;
        this.angle = angle;
        this.speed = speed;
        this.startTime = startTime;
        this.touchedIds = [];
    }
    getPosition(time) {
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
    constructor(tickOffset = 0, id) {
        this.speed = 100;
        this.tickOffset = tickOffset;
        this.gameRadius = 20;
        this.health = 3;
        this.id = id;
    }
    getPositionInformation(time, path, totalPathLength) {
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
class SimpleEnemy extends Enemy {
}
const GameEnemies = [];
for (let i = 0; i < 10; i++) {
    GameEnemies.push(new SimpleEnemy(-i, i));
}
//! Towers
class Tower {
    constructor(location, id) {
        this.range = 100;
        this.location = location;
        this.maxTickCoolDown = 1;
        this.tickCoolDown = 0;
        this.id = id;
    }
    getEnemiesInRange(time, enemies, path, totalPathLength) {
        return enemies.filter((enemy) => {
            if (enemy.dead)
                return;
            const enemyPosition = enemy.getPositionInformation(time, path, totalPathLength);
            if (enemyPosition === undefined)
                return;
            const { location: enemyLocation } = enemyPosition;
            return distance(enemyLocation, this.location) <= this.range;
        });
    }
    targetEnemies(time, enemies, path, totalPathLength) {
        var _a;
        const enemiesInRange = this.getEnemiesInRange(time, enemies, path, totalPathLength);
        const closestEnemy = enemiesInRange[0];
        this.tickCoolDown--;
        if (this.tickCoolDown < 0) {
            this.tickCoolDown = this.maxTickCoolDown;
        }
        if (this.tickCoolDown !== 0) {
            return;
        }
        if (closestEnemy === undefined)
            return;
        const enemyPosition = (_a = closestEnemy.getPositionInformation(time, path, totalPathLength)) === null || _a === void 0 ? void 0 : _a.location;
        if (enemyPosition === undefined)
            return;
        const enemyAngle = angleOf(this.location, enemyPosition);
        return [new Bullet(this.location, enemyAngle, 400, time)];
    }
}
class SimpleTower extends Tower {
}
class MultiHitTower extends Tower {
    targetEnemies(time, enemies, path, totalPathLength) {
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
        let bullets = [];
        for (let i = 0; i < amountOfBullets; i++) {
            let bulletAngle = (fullCircle / amountOfBullets) * i;
            bullets.push(new Bullet(this.location, bulletAngle, 400, time));
        }
        return bullets;
    }
}
//! Game Manager
class Game {
    constructor(gameCanvas, uiContainer, path, startTime) {
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
        gameCanvas.addEventListener('click', () => {
            this.onClick();
        });
    }
    // runs every tick  for cleanup and stuff
    tick(time) {
        this.projectiles = this.projectiles.filter((bullet) => isPointInRectangle(bullet.getPosition(time), { x: 0, y: 0 }, { x: this.gameWidth, y: this.gameHeight }));
    }
    physics() {
        return __awaiter(this, void 0, void 0, function* () {
            const time = (Date.now() - this.startTime) / 1000;
            this.tick(time);
            // collision
            for (const bullet of this.projectiles) {
                const bulletPosition = bullet.getPosition(time);
                for (const enemy of GameEnemies) {
                    if (bullet.touchedIds.includes(enemy.id)) {
                        continue;
                    }
                    const enemyPosition = enemy.getPositionInformation(time, this.path, this.totalPathLength);
                    if (enemyPosition === undefined)
                        continue;
                    const dist = distance(bulletPosition, enemyPosition.location);
                    if (dist <= enemy.gameRadius) {
                        enemy.health -= 1;
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
        });
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = this.gameCanvas.getContext('2d');
            if (ctx === null) {
                throw new Error('unable to get context');
            }
            const frame = () => {
                var _a;
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
                    if (enemy.dead)
                        continue;
                    const enemyPosition = (_a = enemy.getPositionInformation(time, this.path, this.totalPathLength)) === null || _a === void 0 ? void 0 : _a.location;
                    if (enemyPosition === undefined)
                        continue;
                    ctx.beginPath();
                    ctx.arc(enemyPosition.x, enemyPosition.y, enemy.gameRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    ctx.fillStyle = 'black';
                }
                // towers
                for (const tower of this.towers) {
                    ctx.beginPath();
                    ctx.arc(tower.location.x, tower.location.y, 15, 0, Math.PI * 2);
                    ctx.fillStyle = 'brown';
                    ctx.fill();
                    ctx.fillStyle = 'black';
                    // 20 is the tower "hitbox"
                    if (distance(this.mouseCoords, tower.location) <= 20) {
                        ctx.beginPath();
                        ctx.arc(tower.location.x, tower.location.y, tower.range, 0, Math.PI * 2);
                        ctx.setLineDash([10, 10]);
                        ctx.stroke();
                        ctx.setLineDash([0]);
                    }
                }
                window.requestAnimationFrame(frame);
            };
            window.requestAnimationFrame(frame);
        });
    }
    renderTowerUI(tower) {
        this.uiContainer.innerText = `Current selected tower: ${tower === null || tower === void 0 ? void 0 : tower.id}`;
    }
    onClick() {
        var _a;
        const closestTowers = this.towers.sort((a, b) => distance(this.mouseCoords, a.location) - distance(this.mouseCoords, b.location));
        let currentSelectedTower;
        if (closestTowers.length >= 1 &&
            distance(closestTowers[0].location, this.mouseCoords) <= 20) {
            currentSelectedTower = closestTowers[0];
        }
        if (((_a = this.selectedTower) === null || _a === void 0 ? void 0 : _a.id) !== (currentSelectedTower === null || currentSelectedTower === void 0 ? void 0 : currentSelectedTower.id)) {
            this.selectedTower = currentSelectedTower;
            this.renderTowerUI(currentSelectedTower);
        }
    }
    onMouseMove(e) {
        this.mouseCoords.x = e.offsetX;
        this.mouseCoords.y = e.offsetY;
    }
}
const init = () => {
    const gameCanvas = document.querySelector('canvas');
    const uiContainer = document.getElementById('ui');
    if (gameCanvas === null || uiContainer === null) {
        console.error(`Error locating necessary html elements`, { gameCanvas, uiContainer });
        throw new Error();
    }
    const GAME_WIDTH = gameCanvas.width;
    const GAME_HEIGHT = gameCanvas.height;
    const path = [
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
//# sourceMappingURL=tower-defense.js.map