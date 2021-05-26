import * as React from "react";

interface ICardProps {
    flex?: boolean,
    className?: string,
    style?: React.CSSProperties
}

const Card: React.FC<ICardProps> = ({ children, flex = true, className, style }) => {
    return (
        <div className={`relative p-3 m-5 bg-black bg-opacity-30 rounded-xl shadow-2xl${className && ` ${className}`}${flex && " flex"}`} style={style}>
            {children}
        </div>
    );
}

export default Card;
