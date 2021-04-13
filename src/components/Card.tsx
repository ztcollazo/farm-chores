import * as React from "react";

interface ICardProps {
    flex?: boolean
}

const Card: React.FC<ICardProps> = ({ children, flex = true }): JSX.Element => {
    return (
        <div className={`relative p-3 m-5 bg-black bg-opacity-30 rounded-xl shadow-2xl${flex && " flex"}`}>
            {children}
        </div>
    );
}

export default Card;