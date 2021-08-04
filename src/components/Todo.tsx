import * as React from "react";
import Card from "./Card";
import {doneListId, todoBoardId, todoListId, TrelloContext} from "./context";
import Checkbox from "./Checkbox";
import {authorize} from "./helpers";

const Todo: React.FC = () => {
    const {setToken, trelloInstance: trello, token, trelloEvents} = React.useContext(TrelloContext);
    const [cards, setCards] = React.useState([]);

    trelloEvents.once('token', (token) => getCards());
    trelloEvents.on('card-updated', (res, cardId) => setCards(cards.filter((c) => c.id !== cardId).concat([res])));

    const getCards = () => {
        trello.getBoardCards(todoBoardId,{}, setCards, console.error);
    }

    const updateCard = (card: Record<string, never>) => {
        trello.updateCard(card.id, {idList: card.idList === todoListId ? doneListId : todoListId}, (res: unknown) => {
            trelloEvents.emit('card-updated', res, card.id)
        }, console.error);
    }

    return (
       <Card className="w-1/3">
           {
               !token ?
                   <button className="w-3/4 h-10 rounded-2xl m-auto inline" style={{backgroundColor: "#0369A7", color: "#D2E1ED"}} type="button" onClick={() => authorize(trello, setToken, trelloEvents)}>Authorize Trello</button> :
                   <ul>
                       {cards.sort((a, b) => a.idList === doneListId ? 1 : a.idList === todoListId ? -1 : b.idList === todoListId ? -1 : 1).map((c) => <Checkbox key={c.name} checked={c.idList !== todoListId} onChange={() => updateCard(c)}>{c.name}</Checkbox>)}
                   </ul>

           }
       </Card>
    );
}

export default Todo;
