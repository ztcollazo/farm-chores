import * as React from "react";
import Card from "./Card";
import {projectBoardId, TrelloContext} from "./context";
import {authorize} from "./helpers";
import Rodal from "rodal";
import "rodal/lib/rodal.css"

interface IProjectProps {
    card: Record<string, unknown>,
    percent: number
}

const Project: React.FC<IProjectProps> = ({card, percent}) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="rounded-2xl scroll-snap-child my-auto static rounded hover:bg-black p-4 hover:bg-opacity-20">
            <div className="flex flex-col" onClick={() => setOpen(true)}>
                <div className="text-xl relative my-auto">{card.name}</div>
                <div className="h-1 relative rounded-full">
                    <div className="w-full bg-gray-200 absolute rounded-full h-1" />
                    <div className="h-1 bg-green-500 absolute rounded-full" style={{width: `${percent}%`}} />
                </div>
            </div>
            <Rodal
                visible={open}
                closeOnEsc
                onClose={(): void => setOpen(false)}
                customMaskStyles={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)"
                }}
                showCloseButton={false}
                customStyles={{
                    borderRadius: '0.75rem',
                    backgroundColor: "rgba(200, 200, 200, 0.7)"
                }}
            >
                <div onClick={() => setOpen(false)} className="absolute top-4 right-4">

                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>
                </div>
                <div>
                    test
                </div>
            </Rodal>
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
        <Card style={{minHeight: "120px", height: "50%", maxHeight: "50%"}}>
            {
                !token ?
                    <button className="w-3/4 h-10 rounded-2xl m-auto inline" style={{backgroundColor: "#0369A7", color: "#D2E1ED"}} type="button" onClick={() => authorize(trello, setToken, trelloEvents)}>Authorize Trello</button> :
                    <div className="scroll-snap-parent w-full grid grid-cols-3 scrollbar-none overflow-scroll">
                        {
                            cards.map((c, i) => {
                                return (
                                    <Project card={c} percent={(c.badges.checkItemsChecked / c.badges.checkItems) * 100} />
                                )
                            })
                        }
                    </div>
            }
        </Card>
    );
}

export default Projects;
