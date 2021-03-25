import * as React from "react";
import ContextProvider from "./Context";

const Main = (): JSX.Element => {
    return (
        <ContextProvider apiKey={process.env.WEATHER_API_KEY}>
            <h1>Hello, React + Electron Forge</h1>
            <p>
                Meet the new combo. Typescript, Webpack, and ESLint Included
            </p>
        </ContextProvider>
    )
}

export default Main;