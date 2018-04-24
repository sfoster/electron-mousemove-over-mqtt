class DisplayOutput {
  constructor(options={}) {
    this.positions = null;
    this.options = options;
    console.assert(this.options.node, "DisplayOutput needs an options.node for output");
  }
  start() {
    this.running = true;
    this.canvas = this.options.node;
    this.ctx = this.canvas.getContext('2d');
    this.positions = [];
    this.tick();
  }
  stop(){
    this.running = false;
  }
  _drawDot(posn) {
    let ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(posn.x, posn.y, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = `rgba(0, 51, 153, ${posn.opacity})`;
    ctx.fillOpacity = posn.opacity;
    ctx.fill();
  }
  drawDot(posn, color) {
    if (!this.running) {
      this.start();
    }
    console.log(`drawDot, unshift x: ${posn.x}, y: ${posn.y}`);
    posn.color = color;
    this.positions.unshift(posn);
  }
  tick() {
    if (!this.running) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let count = this.positions.length;
    if (count > 32) {
      count = this.positions.length = 32;
    }
    for (let i = count - 1; i >= 0; i--) {
      let dot = this.positions[i];
      dot.opacity = 1/(i+1);
      this._drawDot(dot);
    }
    requestAnimationFrame(() => { this.tick(); });
  }
}

if (require && module) {
  module.exports = DisplayOutput;
}
