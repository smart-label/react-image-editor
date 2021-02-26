import BoundingBox from "./BoundingBox";
import { isPointInside, KEYS } from "./util";

export default class Selection {
  constructor(events, selectedImage) {
    this.events = events;
    this.selectedImage = selectedImage;
  }
  shouldReset() {
    const keyboardEvent = this.events[this.events.length - 1];
    if (keyboardEvent && keyboardEvent.keyCode) {
      if (keyboardEvent.keyCode === KEYS.DELETE) {
        return true;
      }
    }

    const lastAction = this.events.findIndex((e) => e.type === "mouseup");
    if (lastAction > -1) {
      return true;
    }
    return false;
  }

  shouldStore() {
    return false;
  }
  path() {
    const firstAction = this.events.findIndex((e) => e.type === "mousedown");
    if (firstAction === -1) {
      return [];
    }
    return this.events.slice(firstAction);
  }

  shouldDrag() {
    const path = this.path();
    if (path.length >= 2) return path;
    return false;
  }
}
