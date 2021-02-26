import { action, runInAction } from "mobx";
import { observer } from "mobx-react";
import { useLocalObservable } from "mobx-react-lite";
import React, { useContext } from "react";
import { StoreContext } from "./../store.js";
import ProjectView from "./ProjectView";

const LocalProjectStore = (store) => {
  const state = {
    title: "",
    folderPath: "/Users/apple/dev/smart-label/docs/object-detection-tutoiral",
    errorMessage: "",
    setTitle({ target }) {
      this.title = (target && target.value) || "";
    },
    setFolderPath({ target }) {
      this.folderPath = (target && target.value) || "";
    },
    setErrorMessage(value) {
      this.errorMessage = value;
    },
    async create() {
      const { title, folderPath } = this;
      this.setErrorMessage("");
      try {
        await store.projectStore.add({
          title,
          folderPath,
        });
        this.setFolderPath("");
        this.setTitle("");
      } catch (error) {
        if (error.code === "ENOENT") this.setErrorMessage("folder not found.");
        else if (error.code === "EMPTY")
          this.setErrorMessage("folder not Empty.");
        else this.setErrorMessage("Something went wrong!");
        console.log(error);
      }
    },
  };
  return () => state;
};

const Create = observer(() => {
  const store = useContext(StoreContext);
  const state = useLocalObservable(LocalProjectStore(store));
  const { projects } = store.projectStore;

  const {
    errorMessage,
    title,
    setTitle,
    folderPath,
    setFolderPath,
    create,
  } = state;
  return (
    <div>
      {errorMessage !== "" ? errorMessage : null}
      Projects: {projects.length}
      <br />
      {projects.map((p, idx) => (
        <ProjectView key={idx} project={{ id: idx + 1, ...p }} />
      ))}
      <input
        value={title}
        onChange={setTitle}
        type="text"
        placeholder="Enter Project Title .."
        name="title"
      />
      <br />
      <input
        value={folderPath}
        onChange={setFolderPath}
        type="text"
        placeholder="Enter Folder Path .."
        name="title"
      />
      <br />
      <button onClick={() => create({ title, folderPath })}>Create</button>
    </div>
  );
});

export default Create;
