import * as React from "react";
import Weather from "./Weather";
import Calendar from "./Calendar";
import Todo from "./Todo";
import {TrelloContext, TodoContext} from "./context";
import Trello from "../lib/trello-api";
import Projects from "./Projects";
import {authorize, TrelloEvents} from "./helpers";

const Main: React.FC = () => {
    const [key, setKey] = React.useState(process.env.TRELLO_API_KEY);
    const trello = new Trello({key});
    const trelloEventEmitter = new TrelloEvents();
    const [token, setToken] = React.useState(trello.token);
    const [trelloInstance, setTrelloInstance] = React.useState(trello);
    const [todos, setTodos] = React.useState([])
    const [trelloEvents, setTrelloEvents] = React.useState(trelloEventEmitter)

    React.useEffect(() => {
        if (trello.tokenFound) {
            authorize(trello, setToken, trelloEvents);
        }
    }, []);

    return (
        <TrelloContext.Provider value={{token, setToken, key, setKey, trelloInstance, setTrelloInstance, trelloEvents, setTrelloEvents}}>
            <TodoContext.Provider value={{todos, setTodos}}>
                <div id={"container"} className="bg-gradient-to-tr scrollbar-none from-red-600 to-blue-600 scroll-snap-parent">
                    <div id="1" className="scroll-snap-child min-h-screen relative flex flex-col w-full">
                        <Weather />
                        <div className="flex flex-row flex-grow w-full h-full">
                            <Todo />
                            <Calendar />
                        </div>
                    </div>
                    {/*
                        Add this for testing purposes. Once I get the other
                        components in, I'll switch those out. Just had to get the scroll
                        snap 😉
                    */}
                    <div id="2" className="scroll-snap-child min-h-screen relative flex flex-col w-full">
                        <Projects />
                    </div>
                </div>
                </TodoContext.Provider>
        </TrelloContext.Provider>
    )
}

export default Main;
