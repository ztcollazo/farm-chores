import * as React from "react";
import Card from "./Card";
// import { useAsyncFn, useAsync } from "react-use";
import Trello from "../lib/trello-api";
import {TrelloContext} from "./context";

const authorize = (trello: Trello, setState: (value: string) => void) => {
    trello.authorize({
        persist: true,
        interactive: true,
        scope: {
            read: true,
            write: true,
            account: true
        },
        expiration: "never",
        name: "Farm Chores Manager",
        type: "window",
        success: console.log,
        error: console.error
    });
    setState(trello.token);
}

const Todo: React.FC = (): JSX.Element => {
    const {token, setToken, trelloInstance: trello} = React.useContext(TrelloContext);
    console.log(token);

    return (
       <Card className="w-1/3">
           {
               !trello.token ?
                   <button className="w-3/4 h-10 rounded-2xl m-auto inline" style={{backgroundColor: "#0369A7", color: "#D2E1ED", fontFamily: '-apple-system,system-ui,"Segoe UI",Roboto,"Noto Sans",Ubuntu,"Droid Sans", "Helvetica Neue",sans-serif'}} type="button" onClick={() => authorize(trello, setToken)}>Authorize Trello</button> :
                   <p className="overflow-scroll">{token}</p>
           }
       </Card>
    );
}

export default Todo;
