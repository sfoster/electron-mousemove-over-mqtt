class MouseInput {
  constructor(options = {}) {
    this.options = options;
    console.assert(this.options.node, "MouseInput needs an options.node");

    console.log("MouseInput.constructor, watching visibilitychange");
    let doc = this.options.node.ownerDocument;
    doc.addEventListener("visibilitychange", this);
    if (!doc.hidden) {
      this.start();
    }
  }
  start() {
    console.log("MouseInput.start, watching mousemove");
    this.options.node.addEventListener("mousemove", this);
  }
  pause() {
    console.log("MouseInput.pause, unwatching mousemove");
    this.options.node.removeEventListener("mousemove", this);
  }
  handleEvent(event) {
    let doc = this.options.node.ownerDocument;
    if (event.type == "visibilitychange") {
      switch (doc.visibilityState) {
        case "visible":
          this.start();
          break;
        case "hidden":
          this.pause();
          break;
      }
    }
    if (event.type == "mousemove") {
      if (typeof this.onEvent == "function") {
        this.onEvent([{ x: event.offsetX, y: event.offsetY}]);
      }
    }
  }
};

if (require && module) {
  module.exports = MouseInput;
}
