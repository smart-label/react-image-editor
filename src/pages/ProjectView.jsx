import React from "react";
import { Link } from "react-router-dom";

export default function ProjectView({ project }) {
  return (
    <div>
      {project.id} | Title: {project.title} | Path: {project.folderPath} |
      contains {project.files.length} files.
      <Link to={`/editor/${project.id}`}> Edit </Link>
    </div>
  );
}
