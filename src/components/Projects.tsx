import * as React from "react";
import Card from "./Card";
import {projectBoardId, TrelloContext} from "./context";
import {authorize} from "./helpers";

interface IProjectProps {
    card: Record<string, unknown>,
    percent: number
}

const Project: React.FC<IProjectProps> = ({card, percent}) => {
    return (
        <div className="rounded-2xl w-full static">
            <span className="text-xl relative my-auto">{card.name}</span>
            <div className="h-1 relative left-1/4 my-auto -top-4 rounded-full" style={{width: window.innerWidth / (4/3)}}>
                <div className="w-full bg-gray-200 absolute rounded-full h-1" />
                <div className="h-1 bg-green-500 absolute rounded-full" style={{width: `${percent}%`}} />
            </div>
        </div>
    );
}

const Projects: React.FC = () => {
    const [cards, setCards] = React.useState([]);
    const {trelloInstance: trello, setToken, token, trelloEvents} = React.useContext(TrelloContext);

    const getProjects = () => {
        trello.getBoardCards(projectBoardId,{}, setCards, console.error);
    }

    trelloEvents.once('token', () => getProjects());

    return (
        <Card style={{minHeight: "120px", height: "120px", maxHeight: "120px"}}>
            {
                !token ?
                    <button className="w-3/4 h-10 rounded-2xl m-auto inline" style={{backgroundColor: "#0369A7", color: "#D2E1ED"}} type="button" onClick={() => authorize(trello, setToken, trelloEvents)}>Authorize Trello</button> :
                    <ul className="list-none">
                        {
                            cards.map((c, i) => {
                                return (
                                    <li key={i}>
                                        <Project card={c} percent={(c.badges.checkItemsChecked / c.badges.checkItems) * 100} />
                                    </li>
                                )
                            })
                        }
                    </ul>
            }
        </Card>
    );
}

export default Projects;
