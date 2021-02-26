import BoundingBox from "./BoundingBox";

export function MP(canvas, pt) {
  const rect = canvas.getBoundingClientRect();
  const sX = canvas.width / rect.width;
  const sY = canvas.height / rect.height;
  return [(pt[0] - rect.left) * sX, (pt[1] - rect.top) * sY];
}

export function getConversionScales(canvas) {
  const rect = canvas.getBoundingClientRect();
  const sX = canvas.width / rect.width;
  const sY = canvas.height / rect.height;
  return [sX, sY];
}

export function clearRect(canvas) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);
}

export function drawImage(canvas, image) {
  canvas.getContext("2d").drawImage(image, 100, 100);
}

export function toPoint(event) {
  return [event.clientX, event.clientY];
}
export function toMPPoint(canvas, event) {
  return MP(canvas, [event.clientX, event.clientY]);
}

export function isPointInside(pt, object) {
  switch (object.type) {
    case "POLYGON":
      break;
    case "BOUNDING_BOX":
      const t = new BoundingBox(object.path);
      return t.inside(pt);
      break;
  }
  return false;
}

export function almostEqual(x1, x2, epsilon) {
  const distance = Math.sqrt(
    Math.pow(x1[0] - x2[0], 2) + Math.pow(x1[1] - x2[1], 2)
  );
  return distance < epsilon;
}

export function pointsEqual(p1, p2) {
  return p1.x == p2.x && p1.y == p2.y;
}

export function insidePolygon(pt, poly) {
  // https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
  const num = poly.length;
  const x = pt.x;
  const y = pt.y;
  let j = num - 1;
  let c = false;
  for (let i = 0; i < num; i++) {
    const a = poly[i].y > y != poly[j].y > y;
    const b =
      poly[i].x +
      ((poly[j].x - poly[i].x) * (y - poly[i].y)) / (poly[j].y - poly[i].y);
    if (a && x < b) {
      c = !c;
    }
    j = i;
  }
  return c;
}

export function insideSquare(pt, path) {
  let p1 = path[0];
  let p2 = path[1];
  if (p2.x - p1.x <= 0) {
    let ptmp = p1.x;
    p1.x = p2.x;
    p2.x = ptmp;
  }

  if (p2.y - p1.y <= 0) {
    let ptmp = p1.y;
    p1.y = p2.y;
    p2.y = ptmp;
  }
  return pt.x > p1.x && pt.x < p2.x && pt.y > p1.y && pt.y < p2.y;
}

export const KEYS = {
  DELETE: 8,
};
