import { MP, almostEqual } from "./util";

export default class Polygon {
  constructor(events) {
    this.events = events;
  }
  shouldReset() {
    const path = this.path();
    if (path.length < 2) return false;
    const first = path[0];
    const last = path[path.length - 1];
    const secondLast = path[path.length - 2];
    const toFirst = almostEqual(
      [last.clientX, last.clientY],
      [first.clientX, first.clientY],
      5
    );

    const toLast = almostEqual(
      [last.clientX, last.clientY],
      [secondLast.clientX, secondLast.clientY],
      0.1
    );

    return toFirst || toLast;
  }

  shouldStore() {
    const path = this.path();
    if (path.length > 2) return true;
  }
  path() {
    const polygonPoints = [];
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].type === "mouseup") {
        polygonPoints.push(this.events[i]);
      }
    }
    return polygonPoints;
  }
  draw(canvas) {
    const ctx = canvas.getContext("2d");
    const path = this.path();
    if (path.length == 1) {
      ctx.fillStyle = "rgba(50, 50, 0, 0.5)";
      const pt = MP(canvas, [path[0].clientX, path[0].clientY]);
      ctx.fillRect(pt[0], pt[1], 1, 1);
    } else if (path.length > 1) {
      ctx.fillStyle = "rgba(50, 50, 0, 0.5)";
      const p0 = MP(canvas, [path[0].clientX, path[0].clientY]);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      for (let i = 1; i < path.length; i++) {
        let p = MP(canvas, [path[i].clientX, path[i].clientY]);
        ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}
