import * as React from "react";
import * as ReactDOM from "react-dom";
import Main from "./components/Main"

function render(): void {
    ReactDOM.render(<Main />, document.getElementById("app"));
}

render();