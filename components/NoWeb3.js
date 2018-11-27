import React from "react";
import {browserName, isMobile, isAndroid, isIOS, BrowserView, MobileView} from "react-device-detect";

class NoDappBrowser extends React.Component {



    constructor(props) {
        super(props);
        this.openBrowserStore = this.openBrowserStore.bind(this);
    }

    openBrowserStore(e){
        if (isMobile) {
            if (isIOS) window.open('https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409?mt=8');
            if (isAndroid) window.open('https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp');
        }
        else {
            switch (browserName) {
                case "Opera":
                    window.open('https://addons.opera.com/en/extensions/details/metamask/', '_blank');
                    break;
                case "Chrome":
                    window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank');
                    break;
                case "Firefox":
                    window.open('https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/', '_blank');
                    break;
                default:
                    window.open('https://metamask.io','_blank');
            }
        }
    }

    render() {
        let browserText;
        if (isMobile === false && ["Chrome", "Firefox", "Brave", "Opera"].includes(browserName)){
            browserText = "Looks like you don't have an ethereum browser extension installed, consider installing Metamask!"
        }
        else{
            browserText = "Your browser does not work with the decentralized web, consider using Chrome, Firefox, Opera, or Brave!"
        }
        return (
            <div className='Bodytext-top-div'>
                <div align="center"><h1 className='Body-h1'>Decentralized proof of authorship</h1></div>
                <div>
                    <h2 className='Body-h2'>Not connected to the ethereum network</h2>
                    <BrowserView>
                        <div>
                            <text className='Body-text'>{browserText}
                            </text>
                        </div>
                        <img src="https://i.imgur.com/uURD8CB.png" onClick={this.openBrowserStore}/>
                    </BrowserView>
                    <MobileView>
                        <div>
                            <text className='Body-text'>Looks like you don't have an ethereum capable browser, consider
                                installing trust browser!
                            </text>
                        </div>
                        <img src="https://i.imgur.com/jAWcguw.png" onClick={this.openBrowserStore}/>
                    </MobileView>
                </div>
            </div>
        );
    }
}

export default NoDappBrowser;