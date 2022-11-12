class ClockWidget {
    constructor(container) {
        if (container === null) {
            throw new Error('Container is null');
        }
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        this.container = container;
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasSize = canvas.width;
        this.container.appendChild(canvas);
        // check every 500ms just to be safe an not skip a second
        const frame = () => {
            const time = this.getCurrentTime();
            this.render(time);
        };
        frame();
        window.setInterval(() => {
            frame();
        }, 500);
    }
    getCurrentTime() {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        return { hours: hour, minutes: minute, seconds: second };
    }
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    }
    render(time) {
        this.clearCanvas();
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.imageSmoothingEnabled = false;
        const startAngle = Math.PI / 2; // 0 is at the top of the clock, which corresponds to 90 deg -> pi/2 rad
        // the time should multiplied by -1 because the clock hands go clockwise (which the name may suggest)
        // which is a negative amount of degrees. however, since the coordinates in the terminal are flipped
        // in js we actually don't need to multiply by -1.
        const hourAngle = -startAngle + (time.hours / 12) * (2 * Math.PI);
        const minuteAngle = -startAngle + (time.minutes / 60) * (2 * Math.PI);
        const secondAngle = -startAngle + (time.seconds / 60) * (2 * Math.PI);
        const hourLocation = [
            Math.cos(hourAngle) * (this.canvasSize / 2) * (1 / 2) + this.canvasSize / 2,
            Math.sin(hourAngle) * (this.canvasSize / 2) * (1 / 2) + this.canvasSize / 2,
        ];
        const minuteLocation = [
            Math.cos(minuteAngle) * (this.canvasSize / 2) * (3 / 4) + this.canvasSize / 2,
            Math.sin(minuteAngle) * (this.canvasSize / 2) * (3 / 4) + this.canvasSize / 2,
        ];
        const secondLocation = [
            Math.cos(secondAngle) * (this.canvasSize / 2) * (4 / 5) + this.canvasSize / 2,
            Math.sin(secondAngle) * (this.canvasSize / 2) * (4 / 5) + this.canvasSize / 2,
        ];
        this.ctx.beginPath();
        this.ctx.arc(this.canvasSize / 2, this.canvasSize / 2, (this.canvasSize / 2) * (9 / 10), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.strokeStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasSize / 2, this.canvasSize / 2);
        this.ctx.lineTo(secondLocation[0], secondLocation[1]);
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasSize / 2, this.canvasSize / 2);
        this.ctx.lineTo(hourLocation[0], hourLocation[1]);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasSize / 2, this.canvasSize / 2);
        this.ctx.lineTo(minuteLocation[0], minuteLocation[1]);
        this.ctx.stroke();
    }
}
const main = () => {
    const clockContainer = document.querySelector('.card.c2');
    const clockWidget = new ClockWidget(clockContainer);
};
main();
export {};
//# sourceMappingURL=w.js.map