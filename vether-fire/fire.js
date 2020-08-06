var Direction;
(function (Direction) {
    Direction[Direction["U"] = 0] = "U";
    Direction[Direction["D"] = 1] = "D";
    Direction[Direction["L"] = 2] = "L";
    Direction[Direction["R"] = 3] = "R";
})(Direction || (Direction = {}));
var Fire = /** @class */ (function () {
    function Fire(canvas, options) {
        this.COLOR_STOP_SETS = {
            "original": ["#ffffff", "#ffff00", "#ffd700", "#ff69b4", "#ff6633", "#483d8b"],
            "magical": ["#ffffff", "#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
            "magical2": ["#ffffff", "#d53e4f", "#fc8d59", "#fee08b", "#ffffbf", "#e6f598", "#99d594", "#3288bd"],
            "reddish": ["#ffffff", "#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"],
            "purple": ["#ffffff", "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"]
        };
        this.NUM_COLORS = 16;
        this.FIRE_HEIGHT = 60;
        this.FIRE_WIDTH = 40;
        this.DEFAULT_SCALE = 4;
        this.DEFAULT_BACKGROUND_COLOR = "#000000";
        this.DEFAULT_COLOR_STOP_SET_NAME = "purple";
        this.canvas = canvas;
        this.backgroundColor = options["backgroundColor"] || this.DEFAULT_BACKGROUND_COLOR;
        this.scale = options["scale"] || this.DEFAULT_SCALE;
        this.colorStopSetName = options["colorStopSetName"] || this.DEFAULT_COLOR_STOP_SET_NAME;
        this.colorStopSet = this.COLOR_STOP_SETS[this.colorStopSetName] || this.COLOR_STOP_SETS[this.DEFAULT_COLOR_STOP_SET_NAME];
        this.started = false;
        this.ctx = this.canvas.getContext("2d");
        this.initColors();
        this.canvas.width = this.FIRE_WIDTH * this.scale;
        this.canvas.height = this.FIRE_HEIGHT * this.scale;
    }
    Fire.prototype.start = function () {
        this.initFire();
        this.startAnimation();
        this.started = true;
        this.b00mf();
    };
    Fire.prototype.startAnimation = function () {
        var _this = this;
        this.animationId = window.requestAnimationFrame(function () { return _this.animate(); });
    };
    Fire.prototype.stop = function () {
        if (this.animationId != null) {
            window.cancelAnimationFrame(this.animationId);
        }
        this.started = false;
        this.animationId = null;
    };
    Fire.prototype.b00mf = function () {
        for (var i = 0; i < 100; i++) {
            var x = this.FIRE_WIDTH / 2 + this.randomInt(-8, 8);
            var y = this.FIRE_HEIGHT - 8 + this.randomInt(-16, 4);
            this.fire[y][x] = 0;
        }
    };
    Fire.prototype.initColors = function () {
        this.canvas.hidden = true;
        this.canvas.width = this.NUM_COLORS;
        this.canvas.height = 1;
        var gradient = this.ctx.createLinearGradient(0, 0, this.NUM_COLORS, 0);
        var f = 1.0 / (this.colorStopSet.length + 1);
        for (var i = 0; i < this.colorStopSet.length; i++) {
            var color = this.colorStopSet[i];
            var offset = (i + 1) * f;
            gradient.addColorStop(offset, color);
        }
        gradient.addColorStop(1, this.backgroundColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.NUM_COLORS, 1);
        var imageData = this.ctx.getImageData(0, 0, this.NUM_COLORS, 1).data;
        var colors = new Array(this.NUM_COLORS);
        for (var c = 0, i = 0; i < imageData.length; c++, i += 4) {
            colors[c] = "rgb(" + imageData[i] + ", " + imageData[i + 1] + ", " + imageData[i + 2] + ")";
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.hidden = false;
        this.colors = colors;
    };
    Fire.prototype.initFire = function () {
        var fire = Array();
        for (var r = 0; r < this.FIRE_HEIGHT; r++) {
            fire[r] = new Array(this.FIRE_WIDTH);
            for (var c = 0; c < this.FIRE_WIDTH; c++) {
                fire[r][c] = this.NUM_COLORS;
            }
        }
        this.fire = fire;
    };
    Fire.prototype.animate = function () {
        this.update();
        this.render();
        this.startAnimation();
    };
    Fire.prototype.update = function () {
        // Keep adding fire at the base.
        var x = this.FIRE_WIDTH / 2 + this.randomInt(-1, 1);
        var y = this.FIRE_HEIGHT - 8 + this.randomInt(-12, 1);
        this.fire[y][x] = 0;
        var row;
        for (var r = 0; r < this.FIRE_HEIGHT; r++) {
            for (var c = 0; c < this.FIRE_WIDTH; c++) {
                var x_1 = c;
                var y_1 = r;
                switch (this.randomDirection()) {
                    case Direction.D:
                        y_1++;
                        break;
                    case Direction.L:
                        x_1--;
                        break;
                    case Direction.R:
                        x_1++;
                        break;
                    case Direction.U:
                        y_1--;
                        break;
                }
                var orig = this.fire[r][c];
                var p = (row = this.fire[y_1]) && row[x_1];
                var fa = this.randomFlameAdvancement();
                var q = (p != null && p < orig) ? p : orig;
                q += fa;
                if (q > this.NUM_COLORS)
                    q = this.NUM_COLORS;
                this.fire[r][c] = q;
            }
        }
    };
    Fire.prototype.render = function () {
        for (var r = 0; r < this.FIRE_HEIGHT; r++) {
            for (var c = 0; c < this.FIRE_WIDTH; c++) {
                var color_idx = this.fire[r][c];
                var color = (color_idx == this.NUM_COLORS) ? this.backgroundColor : this.colors[color_idx];
                this.ctx.fillStyle = color;
                this.ctx.fillRect(c * this.scale, r * this.scale, this.scale, this.scale);
            }
        }
    };
    Fire.prototype.randomFlameAdvancement = function () {
        // Make it slightly more likely to return 0 than 1 or 2. A little of this
        // goes a very long way.
        // `d = 0.05; [t+d, t+d + (t-d/2)]`
        var r = Math.random();
        if (r < 0.3833)
            return 0;
        if (r < 0.6916)
            return 1;
        else
            return 2;
    };
    // Direction *from* which to draw inspiration when updating.
    Fire.prototype.randomDirection = function () {
        var r = Math.random();
        if (r < 0.6666)
            return Direction.D;
        if (r < 0.8)
            return Direction.L;
        if (r < 0.93)
            return Direction.R;
        else
            return Direction.U;
    };
    Fire.prototype.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    return Fire;
}());
