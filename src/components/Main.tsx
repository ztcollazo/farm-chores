import * as React from "react";
import Weather from "./Weather";
import Calendar from "./Calendar";
import Todo from "./Todo";
import {TrelloContext, TodoContext} from "./context";
import Trello from "../lib/trello-api";
import Projects from "./Projects";
import {TrelloEvents} from "./helpers";

const Main: React.FC = () => {
    const [key, setKey] = React.useState(process.env.TRELLO_API_KEY);
    const trello = new Trello({key});
    const trelloEventEmitter = new TrelloEvents();
    const [token, setToken] = React.useState(trello.token);
    const [trelloInstance, setTrelloInstance] = React.useState(trello);
    const [todos, setTodos] = React.useState([])
    const [trelloEvents, setTrelloEvents] = React.useState(trelloEventEmitter)

    return (
        <TrelloContext.Provider value={{token, setToken, key, setKey, trelloInstance, setTrelloInstance, trelloEvents, setTrelloEvents}}>
            <TodoContext.Provider value={{todos, setTodos}}>
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
                        <Projects />
                        <div className="flex flex-row w-full h-full">
                            <Todo />
                            <Calendar />
                        </div>
                    </div>
                </div>
                </TodoContext.Provider>
        </TrelloContext.Provider>
    )
}

export default Main;
