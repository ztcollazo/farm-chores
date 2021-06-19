import * as React from "react";

interface ICheckboxProps {
    onChange: (event?: React.ChangeEvent) => any,
    checked: boolean
}

const Checkbox: React.FC<ICheckboxProps> = ({onChange, children, checked}) => {
    return (
        <li className="my-3">
            <label className="text-white text-opacity-30 font-extralight text-xl">
                <input
                    type="checkbox"
                    className="rounded h-4 w-4 bg-gray-200 opacity-60 border-transparent focus:border-transparent focus:bg-gray-200 text-black focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    onChange={onChange}
                    checked={checked}
                />
                {!checked ? <span className="ml-4 opacity-60 text-white">{children}</span> : <s className="ml-4 text-white opacity-60">{children}</s>}
            </label>
        </li>
    );
}

export default Checkbox;
