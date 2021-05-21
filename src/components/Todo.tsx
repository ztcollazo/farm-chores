import * as React from "react";
import Card from "./Card";
import Trello from "../lib/trello-api";
import {doneListId, todoBoardId, todoListId, TrelloContext} from "./context";
import Checkbox from "./Checkbox";

const authorize = (trello: Trello, setState: (value: string) => void, done: (...args: any) => any) => {
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
    done();
}

const Todo: React.FC = (): JSX.Element => {
    const {setToken, trelloInstance: trello} = React.useContext(TrelloContext);
    const [cards, setCards] = React.useState([]);

    const getCards = () => {
        trello.getBoardCards(todoBoardId,{}, setCards, console.error);
    }

    const updateCard = (card: Record<string, never>) => {
        trello.updateCard(card.id, {idList: card.idList === todoListId ? doneListId : todoListId}, (res: unknown) => {
            setCards(cards.filter((c) => c.id !== card.id).concat([res]))
        }, console.error);
    }

    return (
       <Card className="w-1/3">
           {
               !trello.token ?
                   <button className="w-3/4 h-10 rounded-2xl m-auto inline" style={{backgroundColor: "#0369A7", color: "#D2E1ED"}} type="button" onClick={() => authorize(trello, setToken, getCards)}>Authorize Trello</button> :
                   <ul>
                       {cards.sort((a, b) => b.idList === doneListId ? 1 : a.idList === todoListId ? -1 : 1).map((c) => <Checkbox key={c.name} checked={c.idList !== todoListId} onChange={() => updateCard(c)}>{c.name}</Checkbox>)}
                   </ul>

           }
       </Card>
    );
}

export default Todo;
