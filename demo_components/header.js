import React from "react";

function FancyBorder(props) {
    return(
        <header className='Topbar'>
            <div className='Topbar-div'>
                <img className='Topbbar-logo' src={'https://i.imgur.com/9HRkFIC.png'} />
                <text className='Topbar-text'>BlockUSign</text>
            </div>
        </header>
    )
}

export default FancyBorder;