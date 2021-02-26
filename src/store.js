import React from "react";
import { action, makeObservable, observable, runInAction } from "mobx";
import Tools from "./tools.json";
import BoundingBox from "./Tools/BoundingBox";
import { readDirectory } from "./ipc.js";

class EventsStore {
  @observable _events = [];

  constructor() {
    makeObservable(this);
  }
  @action addEvent = (event) => {
    const customEvent = {
      timestamp: event.timeStamp,
      type: event.type,
      clientX: event.clientX,
      clientY: event.clientY,
      x: event.x,
      y: event.y,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      charCode: event.charCode,
      keyCode: event.keyCode,
    };
    this._events.push(customEvent);
  };
  @action reset = () => {
    this._events.replace([]);
  };
  @action resetExceptLast = () => {
    this._events.replace([this._events[this._events.length - 1]]);
  };
  @action updateAt = (i, event) => {
    this._events[i] = event;
  };
  @action deleteRange = (startIndex, endIndex) => {
    const left = this._events.slice(0, startIndex + 1);
    const right = this._events.slice(endIndex + 1, this._events.length);
    this._events.replace(left.concat(right));
  };
  get events() {
    return this._events;
  }
}

class ImageStore {
  @observable _images = [];
  @observable _lastDraggedObject = -1;

  constructor() {
    makeObservable(this);
  }
  @action updateImage(imageId, events) {
    const bb = new BoundingBox(events);
    const image = this.getImage(imageId);
    const lastEvent = events[events.length - 2];
    const endEvent = events[events.length - 1];

    let objectAt = -1;
    if (this._lastDraggedObject > -1) {
      objectAt = this._lastDraggedObject;
    } else {
      const objectsList = bb.insideMultipleObjects(events[0], image.objects);
      if (objectsList.length > 0) {
        objectAt = this._lastDraggedObject = objectsList[0];
      }
    }

    if (objectAt === -1) {
      return;
    }

    const cdx = lastEvent.clientX - endEvent.clientX;
    const dx = lastEvent.x - endEvent.x;

    const cdy = lastEvent.clientY - endEvent.clientY;
    const dy = lastEvent.y - endEvent.y;

    const object = image.objects[objectAt];
    switch (object.type) {
      case "BOUNDING_BOX":
        for (let i = 0; i < object.path.length; i++) {
          object.path[i].clientX -= cdx;
          object.path[i].x -= dx;
          object.path[i].clientY -= cdy;
          object.path[i].y -= dy;
        }
        break;
      case "POLYGON":
        for (let i = 0; i < object.path.length; i++) {
          object.path[i].clientX -= cdx;
          object.path[i].x -= dx;
          object.path[i].clientY -= cdy;
          object.path[i].y -= dy;
        }
        break;
    }
    if (endEvent.type === "mouseup") {
      this._lastDraggedObject = -1;
    }
  }
  @action loadImages(projectId) {
    const project = this.rootStore.projectStore.get(projectId);
    if (!project) {
      throw new Error("loadImages: Project not found.");
    }

    // project.files.map((uri, id) => { id, uri: uri, })
  }
  @action addObject(image, object) {
    this.getImage(image).objects.push(object);
  }
  @action add(image) {
    const _image = {
      id: image.id,
      uri: image.uri,
      objects: image.objects,
    };
    this._images.push(_image);
  }

  getImage(id) {
    if (id >= 0 && id < this._images.length) {
      return this._images[id];
    }
    return null;
  }
}

class UIStore {
  @observable _selectedTool = 1;
  @observable _selectedImage = -1;
  @observable _selectedProject = -1;

  _tools = Tools;
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }
  @action setTool(toolId) {
    if (toolId >= 0 && toolId < this._tools.length) this._selectedTool = toolId;
  }
  @action setProject(id) {
    this._selectedProject = id;
    return this.rootStore.imageStore.loadImages(id);
  }
  get tools() {
    return this._tools;
  }
  get selectedProject() {
    return this.rootStore.projectStore.getProject(this._selectedProject);
  }

  get selectedTool() {
    return this._tools[this._selectedTool];
  }
  get selectedImage() {
    return this.rootStore.imageStore.getImage(this._selectedImage);
  }
  get selectedImageId() {
    return this._selectedImage;
  }
}

class ProjectStore {
  @observable _projects = [];
  constructor(rootStore) {
    this.rootStore = rootStore;
  }
  get projects() {
    return this._projects;
  }
  getProject(id) {
    return this._projects[id];
  }
  async add(project) {
    const files = await readDirectory(project.folderPath);
    if (!files || files.length === 0) {
      const error = new Error("folder is empty.");
      error.code = "EMPTY";
    }
    const _project = {
      folderPath: project.folderPath,
      title: project.title,
      files,
    };
    runInAction(() => {
      this._projects.push(_project);
    });
  }
}

export default class Store {
  constructor() {
    this.eventStore = new EventsStore(this);
    this.uiStore = new UIStore(this);
    this.imageStore = new ImageStore(this);
    this.projectStore = new ProjectStore(this);
  }
}

export const StoreContext = React.createContext({});
