import * as React from "react";
import Weather from "./Weather";
import Calendar from "./Calendar";

const Main = (): JSX.Element => {
    return (
        <div className="absolute flex flex-col w-full h-full bg-gradient-to-tr from-red-600 to-blue-600">
            <Weather />
            <div className="flex flex-row w-full h-full">
                <Calendar />
            </div>
        </div>
    )
}

export default Main;
