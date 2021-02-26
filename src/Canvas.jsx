import React, { Component } from "react";
import { observer } from "mobx-react";
import "./style.css";
import Polygon from "./Tools/Polygon.js";
import BoundingBox from "./Tools/BoundingBox.js";
import Selection from "./Tools/Selection.js";
import { clearRect, toMPPoint } from "./Tools/util.js";
import { StoreContext } from "./store.js";
import { runInAction } from "mobx";

@observer
class Canvas extends Component {
  _image = new Image();

  static contextType = StoreContext;
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this._image.onload = this.onImageLoaded.bind(this);
  }
  componentDidMount() {
    const { selectedImage } = this.context.uiStore;
    if (selectedImage !== null) {
      this.onImageChange();
      this.redraw();
    }
  }
  componentDidUpdate() {
    if (this.canvasRef.current) {
      this.redraw();
    }
  }

  onImageLoaded() {
    console.log("loaded!");
    this.redraw();
  }

  onImageChange() {
    const { uiStore } = this.context;
    const { selectedImage } = uiStore;
    if (this._image.src !== selectedImage.uri) {
      this._image.src = selectedImage.uri;
    }
  }

  redraw() {
    const canvas = this.canvasRef.current;
    const { eventStore, uiStore, imageStore } = this.context;
    const { events } = eventStore;
    const { selectedTool, selectedImage, selectedImageId } = uiStore;

    clearRect(canvas);
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const w = width > this._image.width ? this._image.width : width;
    const h = height > this._image.height ? this._image.height : height;
    ctx.drawImage(this._image, 0, 0, w, h);

    for (let i = 0; i < selectedImage.objects.length; i++) {
      const object = selectedImage.objects[i];
      switch (object.type) {
        case "BOUNDING_BOX":
          const bb = new BoundingBox(object.path);
          bb.draw(canvas);
          break;
        case "POLYGON":
          const poly = new Polygon(object.path);
          poly.draw(canvas);
          break;
      }
    }

    if (events.length <= 0) {
      return;
    }

    switch (selectedTool.id) {
      case "SELECTION":
        const s = new Selection(events, selectedImage);
        const shouldDrag = s.shouldDrag();
        if (shouldDrag) {
          imageStore.updateImage(uiStore.selectedImageId, shouldDrag);
        }
        if (s.shouldReset()) {
          eventStore.reset();
        }
        break;
      case "BOUNDING_BOX":
        const bb = new BoundingBox(events);
        if (bb.shouldReset() && bb.shouldStore()) {
          runInAction(() => {
            imageStore.addObject(selectedImageId, {
              path: bb.path(),
              type: selectedTool.id,
            });
            eventStore.reset();
          });
        }
        bb.draw(canvas);

        break;
      case "POLYGON":
        const poly = new Polygon(events);
        if (poly.shouldReset()) {
          if (poly.shouldStore()) {
            imageStore.addObject(selectedImageId, {
              path: poly.path(),
              type: selectedTool.id,
            });
          }
          eventStore.reset();
        }
        poly.draw(canvas);
        break;
    }
  }

  addEvent(event) {
    const { eventStore } = this.context;
    const canvas = this.canvasRef.current;
    const pt = toMPPoint(canvas, event);
    event.x = pt[0];
    event.y = pt[1];
    eventStore.addEvent(event);
  }

  render() {
    const { eventStore, uiStore } = this.context;
    const { selectedTool, selectedImage } = uiStore;
    if (selectedImage === null) {
      return <div>No Image Selected.</div>;
    }
    return (
      <div>
        {uiStore.tools.map((t, idx) => (
          <button key={t.id} onClick={() => uiStore.setTool(idx)}>
            {t.title}
          </button>
        ))}
        <div>Events Length: {eventStore.events.length}</div>
        <div>UI Tool Selected: {selectedTool.title}</div>
        <div>Objects: {selectedImage.objects.length}</div>
        <div>
          Image resolution: {this._image.width} x {this._image.height} | Canvas
          resolution:
          {this.canvasRef.current ? this.canvasRef.current.width : 0} x
          {this.canvasRef.current ? this.canvasRef.current.height : 0}
        </div>
        <canvas
          width={1920}
          height={1080}
          tabIndex={0}
          ref={this.canvasRef}
          className="canvas-default"
          onKeyUp={this.addEvent.bind(this)}
          onKeyDown={this.addEvent.bind(this)}
          onMouseUp={this.addEvent.bind(this)}
          onMouseDown={this.addEvent.bind(this)}
          onMouseMove={this.addEvent.bind(this)}
        ></canvas>
      </div>
    );
  }
}

export default Canvas;
