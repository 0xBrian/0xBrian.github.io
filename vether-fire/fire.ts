enum Direction { U, D, L, R }

class Fire {
  COLOR_STOP_SETS = {
    "original" : [ "#ffffff", "#ffff00", "#ffd700", "#ff69b4", "#ff6633", "#483d8b" ],
    "magical"  : [ "#ffffff", "#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6" ],
    "magical2" : [ "#ffffff", "#d53e4f", "#fc8d59", "#fee08b", "#ffffbf", "#e6f598", "#99d594", "#3288bd" ],
    "reddish"  : [ "#ffffff", "#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000" ],
    "purple"   : [ "#ffffff", "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177" ],
  }

  NUM_COLORS = 16;
  FIRE_HEIGHT = 50;
  FIRE_WIDTH = 30;

  DEFAULT_SCALE = 4;
  DEFAULT_BACKGROUND_COLOR = "#000000";
  DEFAULT_COLOR_STOP_SET_NAME = "purple";

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  backgroundColor: string;
  scale: number;
  colorStopSetName: string;
  colorStopSet: Array<string>;
  started: boolean;
  colors: string[];
  fire: number[][];  // `colors` indexes, i.e., 0 means brightest/newest
  animationId: number;

  constructor(canvas: HTMLCanvasElement, options: object) {
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

  start() {
    this.initFire();
    this.startAnimation();
    this.started = true;
  }

  startAnimation() {
    this.animationId = window.requestAnimationFrame(() => this.animate());
  }

  stop() {
    if (this.animationId != null) {
      window.cancelAnimationFrame(this.animationId);
    }
    this.started = false;
    this.animationId = null;
  }

  b00mf() {
    for (var i=0; i<100; i++) {
      let x = this.FIRE_WIDTH / 2 + this.randomInt(-8, 8);
      let y = this.FIRE_HEIGHT - 8 + this.randomInt(-16, 4);
      this.fire[y][x] = 0;
    }
  }

  initColors() {
    this.canvas.hidden = true;
    this.canvas.width = this.NUM_COLORS;
    this.canvas.height = 1;
    let gradient = this.ctx.createLinearGradient(0, 0, this.NUM_COLORS, 0);
    let f = 1.0 / (this.colorStopSet.length + 1);
    for (var i=0; i<this.colorStopSet.length; i++) {
      let color = this.colorStopSet[i];
      let offset = (i + 1) * f;
      gradient.addColorStop(offset, color);
    }
    gradient.addColorStop(1, this.backgroundColor);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.NUM_COLORS, 1);
    let imageData = this.ctx.getImageData(0, 0, this.NUM_COLORS, 1).data;
    let colors = new Array<string>(this.NUM_COLORS);
    for (var c=0, i=0; i<imageData.length; c++, i+=4) {
      colors[c] = `rgb(${imageData[i]}, ${imageData[i+1]}, ${imageData[i+2]})`;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.hidden = false;
    this.colors = colors;
  }

  initFire() {
    let fire = Array<Array<number>>();
    for (var r=0; r<this.FIRE_HEIGHT; r++) {
      fire[r] = new Array<number>(this.FIRE_WIDTH);
      for (var c=0; c<this.FIRE_WIDTH; c++) {
        fire[r][c] = this.NUM_COLORS;
      }
    }
    this.fire = fire;
  }

  animate() {
    this.update();
    this.render();
    this.startAnimation();
  }

  update() {
    // Keep adding fire at the base.
    let x = this.FIRE_WIDTH / 2 + this.randomInt(-1, 1);
    let y = this.FIRE_HEIGHT - 8 + this.randomInt(-12, 1);
    this.fire[y][x] = 0;
    let row;
    for (var r=0; r<this.FIRE_HEIGHT; r++) {
      for (var c=0; c<this.FIRE_WIDTH; c++) {
        let x = c;
        let y = r;
        switch (this.randomDirection()) {
          case Direction.D: y++; break;
          case Direction.L: x--; break;
          case Direction.R: x++; break;
          case Direction.U: y--; break;
        }
        let orig = this.fire[r][c];
        let p = (row = this.fire[y]) && row[x];
        let fa = this.randomFlameAdvancement();
        let q = (p != null && p < orig) ? p : orig;
        q += fa;
        if (q > this.NUM_COLORS)
          q = this.NUM_COLORS;
        this.fire[r][c] = q;
      }
    }
  }

  render() {
    for (var r=0; r<this.FIRE_HEIGHT; r++) {
      for (var c=0; c<this.FIRE_WIDTH; c++) {
        let color_idx = this.fire[r][c];
        let color = (color_idx == this.NUM_COLORS) ? this.backgroundColor : this.colors[color_idx];
        this.ctx.fillStyle = color;
        this.ctx.fillRect(c*this.scale, r*this.scale, this.scale, this.scale);
      }
    }
  }

  randomFlameAdvancement(): number {
    return this.randomInt(0, 2);
  }

  // Direction *from* which to draw inspiration when updating.
  randomDirection(): Direction {
    let r = Math.random();
    if (r < 0.6666) return Direction.D;
    if (r < 0.8)    return Direction.L;
    if (r < 0.93)   return Direction.R;
    else            return Direction.U;
  }

  randomInt(min, max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
