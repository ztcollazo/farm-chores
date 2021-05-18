/* eslint-disable @typescript-eslint/no-empty-function */
import React, {createContext} from "react";
import Trello from "../lib/trello-api";

interface ITrelloContext {
    token: string,
    setToken: React.Dispatch<React.SetStateAction<string>>,
    key: string,
    setKey: React.Dispatch<React.SetStateAction<string>>,
    trelloInstance: Trello,
    setTrelloInstance: React.Dispatch<React.SetStateAction<Trello>>
}

export const TrelloContext = createContext<ITrelloContext>({
    token: "",
    setToken() {},
    key: "",
    setKey() {},
    trelloInstance: null,
    setTrelloInstance() {}
});
