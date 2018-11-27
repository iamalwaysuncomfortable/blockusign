import AdminAbi from '../abis/DocStoreAdmin';
import NoDappBrowser from "./NoWeb3";
import BodyText from "./Bodytext";
import DocForm from "./DocForm";
import React from "react";
import Web3 from "web3";
const managementContractAddress = '0x078478526Dd659edd6816F41Ab0d9ac09ACb146a';

class Web3Gateway extends React.Component{

    constructor(props){
        super(props);
        this.state = {acct:undefined, Web3State:"Unauthorized"};
        this.tick = this.tick.bind(this);
    }

    async componentDidMount() {
        if (window.ethereum) {
            let ethereum = window.ethereum;
            console.log(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();
                window.web3 = new Web3(ethereum);
                let accts = await window.web3.eth.getAccounts();
                let acct = accts[0];
                console.log(this.state.Web3State);
                let adminContract = await new window.web3.eth.Contract(AdminAbi, managementContractAddress);
                // Acccounts now exposed
                this.timerID = setInterval(
                    () => this.tick(),
                    2000
                );
            } catch (error) {
                console.log(error);
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            let accts = await window.web3.eth.getAccounts();
            let acct = accts[0];
            this.setState({Web3State:"Authorized", acct:acct});
            this.timerID = setInterval(
                () => this.tick(),
                2000
            );
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }

    }

    componentWillUnmount() {
        if (this.timerID !== "undefined"){
            clearInterval(this.timerID);
        }
    }

    async tick(){
        let accts = await window.web3.eth.getAccounts();
        console.log(accts);
        if ((typeof accts === "undefined") || ((typeof accts === 'object') && (accts.length === 0))) {
            this.setState({Web3State:"LoggedOut", acct:undefined})
        }
        else if ((typeof accts === 'object') && (accts.length > 0) && this.state.Web3State !== "Authorized") {
            this.setState({Web3State:"Authorized", acct:undefined})
        }
    }

    render(){
        if (typeof window.web3 === "undefined") {
            console.log(window.web3);
            return(
                <div className="main-div">
                    <NoDappBrowser/>
                </div>);
        }
        else {
            return(
                <div className="main-div">
                    <BodyText/>
                    <DocForm acct={this.state.acct} Web3State={this.state.Web3State}/>
                </div>
            );
        }
    }
}

export default Web3Gateway;