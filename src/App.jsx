import React, { Component } from "react";
import Canvas from "./Canvas";
import ImageList from "./ImageList";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Editor from "./pages/Editor";

export default class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to="/create">Create Project</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/users">Users</Link>
                </li>
              </ul>
            </nav>
          </div>
          <Switch>
            <Route path="/create">
              <Create />
            </Route>
            <Route path="/editor/:id">
              <Editor />
            </Route>
            <Route path="/users">{/* <Users /> */}</Route>
            <Route path="/">
              <Create />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
