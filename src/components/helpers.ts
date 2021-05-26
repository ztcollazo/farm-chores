import Trello from "../lib/trello-api";
import EventEmitter from "events";

export class TrelloEvents extends EventEmitter {
    constructor(...args: unknown[]) {
        super(...args);
    }
}

export const authorize = (trello: Trello, setState: (value: string) => void, emitter: EventEmitter) => {
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
    emitter.emit('token', trello.token);
}
