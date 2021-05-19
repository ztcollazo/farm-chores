import * as React from "react";
import Weather from "./Weather";
import Calendar from "./Calendar";
import Todo from "./Todo";
import {TrelloContext} from "./context";
import Trello from "../lib/trello-api";

const Main = (): JSX.Element => {
    const [key, setKey] = React.useState(process.env.TRELLO_API_KEY);
    const trello = new Trello({key})
    const [token, setToken] = React.useState(trello.token);
    const [trelloInstance, setTrelloInstance] = React.useState(trello);

    return (
        <TrelloContext.Provider value={{token, setToken, key, setKey, trelloInstance, setTrelloInstance}}>
            <div id={"container"} className="absolute flex flex-col w-full h-auto bg-gradient-to-tr from-red-600 to-blue-600 wrapper">
                <div id="1" className="child">
                    <Weather />
                    <div className="flex flex-row w-full h-full">
                        <Todo />
                        <Calendar />
                    </div>
                </div>
                {/*
                    Add this for testing purposes. Once I get the other
                    components in, I'll switch those out. Just had to get the scroll
                    snap 😉
                */}
                <div id="2" className="child">
                    <Weather />
                    <div className="flex flex-row w-full h-full">
                        <Todo />
                        <Calendar />
                    </div>
                </div>
            </div>
        </TrelloContext.Provider>
    )
}

export default Main;
