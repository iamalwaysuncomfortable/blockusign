import React from "react";

function BodyText(props) {
    return(
        <div className='Bodytext-top-div'>
            <div align="left"><h1 className='Body-h1'>Decentralized solution to proof authorship</h1></div>
            <div className='Bodytext-body-div'>
                <div>
                    <img src='https://i.imgur.com/fYcBHNv.png'/>
                </div>
                <div>
                    <h2 className='Body-h2'>Ready to secure your work?</h2>
                    <text className='Body-text'>Just put your document and name below, press submit,
                        and the proof of your authorship will be forever stored in the ethereum blockchain!
                    </text>
                </div>

            </div>
        </div>
    )
}

export default BodyText;