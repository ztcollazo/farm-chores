import * as React from "react";

interface ICardProps {
    flex?: boolean,
    className?: string
}

const Card: React.FC<ICardProps> = ({ children, flex = true, className }): JSX.Element => {
    return (
        <div className={`relative p-3 m-5 bg-black bg-opacity-30 rounded-xl shadow-2xl${className && ` ${className}`}${flex && " flex"}`}>
            {children}
        </div>
    );
}

export default Card;