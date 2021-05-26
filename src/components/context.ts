/* eslint-disable @typescript-eslint/no-empty-function */
import React, {createContext} from "react";
import Trello from "../lib/trello-api";
import {TrelloEvents} from "./helpers";

interface ITrelloContext {
    token: string,
    setToken: React.Dispatch<React.SetStateAction<string>>,
    key: string,
    setKey: React.Dispatch<React.SetStateAction<string>>,
    trelloInstance: Trello,
    setTrelloInstance: React.Dispatch<React.SetStateAction<Trello>>,
    trelloEvents: TrelloEvents,
    setTrelloEvents: React.Dispatch<React.SetStateAction<TrelloEvents>>
}

interface ITodoContext {
    todos: Record<string, unknown>[],
    setTodos: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>
}

export const TrelloContext = createContext<ITrelloContext>({
    token: "",
    setToken() {},
    key: "",
    setKey() {},
    trelloInstance: null,
    setTrelloInstance() {},
    trelloEvents: null,
    setTrelloEvents() {}
});

export const TodoContext = createContext<ITodoContext>({
    todos: [],
    setTodos() {}
});

export const todoBoardId = process.env.TODO_BOARD_ID;
export const todoListId = process.env.TODO_LIST_ID;
export const doneListId = process.env.DONE_LIST_ID;
export const projectBoardId = process.env.PROJECT_BOARD_ID;
export const projectTodoListId = process.env.PROJECT_TODO_ID;
export const projectDoneListId = process.env.PROJECT_DONE_ID;
