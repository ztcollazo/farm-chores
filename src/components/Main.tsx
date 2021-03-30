import * as React from "react";
import Weather from "./Weather";

const Main = (): JSX.Element => {
    return (
        <div className="absolute -inset-0 bg-gradient-to-tr from-red-600 to-blue-600">
            <Weather />
        </div>
    )
}

export default Main;