import React from "react";

function NumberList(props){
    const numbers = props.numbers;
    const listItems = numbers.map((num) =>
        <li key={num.toString()}>
            {num}
        </li>
    );
    return (<ul>{listItems}</ul>);
}

function StringList(props) {
    const strings = props.strings;
    return (
        <ul>
            {strings.map((string) =>
                <li> {string} </li>

            )}
        </ul>
    );
}

export {StringList, NumberList};

