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
            <div className="absolute flex flex-col w-full h-full bg-gradient-to-tr from-red-600 to-blue-600">
                <Weather />
                <div className="flex flex-row w-full h-full">
                    <Todo />
                    <Calendar />
                </div>
            </div>
        </TrelloContext.Provider>
    )
}

export default Main;
