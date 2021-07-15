import * as React from "react";
import Card from "./Card";
import {projectBoardId, TrelloContext} from "./context";
import {authorize} from "./helpers";
import Rodal from "rodal";
import "rodal/lib/rodal.css"
import Trello from "../lib/trello-api";
import Checkbox from "./Checkbox";

interface IProjectProps {
    card: Record<string, unknown>,
    percent: number,
    trello: Trello,
    onUpdate: () => void,
    hasUpdated: boolean
}

interface IChecklistProps {
    card: Record<string, any>
    trello: Trello,
    onUpdate: () => void,
    hasUpdated: boolean
}

const Project: React.FC<IProjectProps> = ({card, percent, trello, onUpdate, hasUpdated}) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="rounded-2xl scroll-snap-child my-auto static rounded hover:bg-black p-4 hover:bg-opacity-20">
            <div className="flex flex-col" onClick={() => setOpen(true)}>
                <div className="text-xl font-extralight text-white opacity-60 relative my-auto">{card.name}</div>
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
                width={800}
                height={448}
                showCloseButton
                customStyles={{
                    borderRadius: '0.75rem',
                    backgroundColor: "rgba(150, 150, 150, 0.6)",
                    overflowY: "scroll",
                    maxWidth: "50rem",
                    maxHeight: "28rem",
                }}
            >
                {/*<span role="button" onClick={() => setOpen(false)} className="absolute top-4 right-4">*/}
                {/*    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>*/}
                {/*</span>*/}
                <div>
                    <Checklists card={card} onUpdate={onUpdate} hasUpdated={hasUpdated} trello={trello} />
                </div>
            </Rodal>
        </div>
    );
}

const Checklists: React.FC<IChecklistProps> = ({ card, trello, onUpdate, hasUpdated}) => {
    const [checklists, setChecklists] = React.useState([]);

    React.useEffect(() => {
        card.idChecklists.map((c: string) => {
            trello.getChecklist(c, {}, (res: Record<string, unknown>) => setChecklists([...checklists, res]), console.error);
        })
    }, [])

    const updateCheckItem = (card: string, c: Record<string, any>, i: number) => {
        trello.updateCheckItem(
            card,
            c.idChecklist,
            c.id,
            {
                value: c.state !== 'complete'
            },
            (res: Record<string, unknown>) => {
                setChecklists(
                    checklists.splice(
                        checklists.findIndex(
                            (a) => a.id === c.idChecklist
                        ), 1, checklists.find(
                                (a) => a.id === c.idChecklist
                        ).checkItems.splice(i, 1, res)
                    )
                );
                if (!hasUpdated) {
                    onUpdate();
                }
            },
            console.error
        )
    }

    return (
        <div>
            <h1 className="text-xl text-white font-extralight opacity-60">{card.name}</h1>
            {
                checklists.map((c: Record<string, any>, i) => {
                    return (
                        <div key={i} className="mt-6">
                            <h1 className="text-lg text-white font-extralight opacity-60">{c.name}</h1>
                            <ul>
                                {
                                    c.checkItems.map((l: Record<string, any>, s: number) => {
                                        return <Checkbox onChange={() => updateCheckItem(c.idCard, l, s)} checked={l.state === 'complete'} key={s}>{l.name}</Checkbox>
                                    })
                                }
                            </ul>
                        </div>
                    )
                })
            }
        </div>
    )
}

const Projects: React.FC = () => {
    const [cards, setCards] = React.useState([]);
    const {trelloInstance: trello, setToken, token, trelloEvents} = React.useContext(TrelloContext);
    const [hasUpdated, setHasUpdated] = React.useState(false);

    React.useEffect(() => {
        if (hasUpdated) {
            getProjects();
            setHasUpdated(false);
        }
    }, [hasUpdated]);

    const getProjects = () => {
        trello.getBoardCards(projectBoardId,{}, setCards, console.error);
    }

    trelloEvents.once('token', () => getProjects());

    return (
        <Card>
            {
                !token ?
                    <button className="w-3/4 h-10 rounded-2xl m-auto inline" style={{backgroundColor: "#0369A7", color: "#D2E1ED"}} type="button" onClick={() => authorize(trello, setToken, trelloEvents)}>Authorize Trello</button> :
                    <div className="scroll-snap-parent w-full grid grid-cols-3 scrollbar-none overflow-scroll">
                        {
                            cards.map((c, i) => {
                                return (
                                    <Project hasUpdated={hasUpdated} onUpdate={() => setHasUpdated(true)} key={i} card={c} percent={(c.badges.checkItemsChecked / c.badges.checkItems) * 100} trello={trello} />
                                )
                            })
                        }
                    </div>
            }
        </Card>
    );
}

export default Projects;
