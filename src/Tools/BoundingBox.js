import { insidePolygon, insideSquare, MP, pointsEqual } from "./util";
export default class BoundingBox {
  constructor(events) {
    this.events = events;
  }
  shouldReset() {
    return this.events.findIndex((e) => e.type === "mouseup") > -1;
  }
  shouldStore() {
    const path = this.path();
    if (path) {
      return !pointsEqual(path[0], path[1]);
    }
    return false;
  }
  path() {
    const events = this.events;
    const startIndex = events.findIndex((e) => e.type === "mousedown");
    let endIndex = events.findIndex((e) => e.type === "mouseup");
    if (events.length < 2) return false;
    if (startIndex == -1) return false;
    if (endIndex == -1) endIndex = events.length - 1;
    return [events[startIndex], events[endIndex]];
  }

  draw(canvas) {
    const ctx = canvas.getContext("2d");
    const path = this.path();
    if (!path) return;
    const topLeft = MP(canvas, [path[0].clientX, path[0].clientY]);
    const bottomRight = MP(canvas, [path[1].clientX, path[1].clientY]);
    const width = bottomRight[0] - topLeft[0];
    const height = bottomRight[1] - topLeft[1];
    ctx.fillStyle = "rgba(50, 50, 0, 0.5)";
    ctx.fillRect(topLeft[0], topLeft[1], width, height);
  }
  drawSelection(canvas) {
    const ctx = canvas.getContext("2d");
    const path = this.path();
    if (!path) return;
    const topLeft = MP(canvas, [path[0].clientX, path[0].clientY]);
    const bottomRight = MP(canvas, [path[1].clientX, path[1].clientY]);
    const width = bottomRight[0] - topLeft[0];
    const height = bottomRight[1] - topLeft[1];
    ctx.strokeStyle = "rgb(50, 50, 0)";
    ctx.strokeRect(topLeft[0], topLeft[1], width, height);
  }

  inside(pt) {
    return this.insideSquare(pt, this.path());
  }

  insideMultipleObjects(event, objects) {
    const out = [];

    for (let i = 0; i < objects.length; i++) {
      switch (objects[i].type) {
        case "BOUNDING_BOX":
          if (insideSquare(event, objects[i].path)) {
            out.push(i);
          }
          break;
        case "POLYGON":
          if (insidePolygon(event, objects[i].path)) {
            out.push(i);
          }
          break;
      }
    }
    return out;
  }
}
