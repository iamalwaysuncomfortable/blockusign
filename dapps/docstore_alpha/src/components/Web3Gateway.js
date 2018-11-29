import AdminContractData from '../abis/DocStoreAdmin';
import DocContractData from '../abis/DocStore';
import NoDappBrowser from "./NoWeb3";
import BodyText from "./Bodytext";
import DocForm from "./DocForm";
import ExistingDocTable from "./ExistingDocTable";
import React from "react";
import Web3 from "web3";
const adminAbi = JSON.parse(AdminContractData.abi);
const docStoreAbi = JSON.parse(DocContractData.abi);
const rinkebyAdminAddress = '0x4469dd74B6b7A128656ACAA12eA50aA28DdFC7Ca';
const kovanAdminAddress = '0x11d4e1004eC2F17Ca276915fEDc55f55A0119a56';
const ropstenAdminAddress = '0x7244De217AfFF2174cec59F882B775B18F4aBcf4';
const nullAddress = "0x0000000000000000000000000000000000000000";
const networkLookupTable = {'1':undefined, '3':ropstenAdminAddress, '4':rinkebyAdminAddress,'42':kovanAdminAddress};

class Web3Gateway extends React.Component{

    constructor(props){
        super(props);
        this.state = {acct:undefined, Web3State:"Unauthorized", adminContract: undefined,
            networkVersion:undefined, userContractAddress:nullAddress, actionState:undefined,
            docEventEmitter:undefined, docEvents:[], docContract:undefined};
        this.tick = this.tick.bind(this);
        this.handleMetaMaskChanges = this.handleMetaMaskChanges.bind(this);
        this.createDocStorageContract = this.createDocStorageContract.bind(this);
        this.iniateDocumentAccess = this.iniateDocumentAccess.bind(this);
        this.storeEvent = this.storeEvent.bind(this);
    }

    async createDocStorageContract(e){
        let userContractAddress;
        e.preventDefault();
        console.log("Firing Contract Deploy");
        this.setState({actionState:"attemptContractDeploy"});
        try {
            await this.state.adminContract.methods.storeNewUserContractAddress().send({
                from: this.state.acct,
                gas: 1000000
            });
            userContractAddress = await this.state.adminContract.methods.checkIfUserHasStorageContract().call();
            this.setState({userContractAddress:userContractAddress});
        }
        catch (e) {
            console.log(e);
            this.setState({actionState:"contractDeployFailed"});
        }
        console.log(userContractAddress);
    }

    async handleMetaMaskChanges(e) {
        if (e.networkVersion !== this.state.networkVersion) {
            if (e.networkVersion in networkLookupTable) {
                let adminContract = await new window.web3.eth.Contract(adminAbi, networkLookupTable[e.networkVersion]);
                this.setState({networkVersion:e.networkVersion, adminContract:adminContract});
            }
        }
        if (e.selectedAddress !== this.state.acct) {
            let userContractAddress;
            if (typeof this.state.adminContract === 'object'){
                userContractAddress = await this.state.adminContract.methods.checkIfUserHasStorageContract().call();
            } else {
                userContractAddress = nullAddress
            }
            if (userContractAddress !== nullAddress) {
                this.setState({acct:e.selectedAddress, userContractAddress:userContractAddress});
            }
        }
    }

    async iniateDocumentAccess(initContracts = true, initEventListeners = true){
        if (initContracts === true) {
            console.log("Attempting to deploy contracts");
            try {
                let docContract;
                let adminContract = await new window.web3.eth.Contract(adminAbi, networkLookupTable[this.state.networkVersion]);
                let userContractAddress = await adminContract.methods.checkIfUserHasStorageContract().call({from: this.state.acct});
                if (userContractAddress !== nullAddress && window.web3.utils.isAddress(userContractAddress)) {
                    try {
                        docContract = await new window.web3.eth.Contract(docStoreAbi, userContractAddress);
                    } catch (e) {
                        console.log(e);
                    }

                }
                this.setState({
                    adminContract: adminContract,
                    userContractAddress: userContractAddress,
                    docContract: docContract
                });
                window.web3.currentProvider.publicConfigStore.on('update', this.handleMetaMaskChanges);
            console.log(this.state.userContractAddress);
            } catch (error) {
                console.log(error);
            }
        }

        if (initEventListeners === true) {
            try {
                if (this.state.userContractAddress !== nullAddress && window.web3.utils.isAddress(this.state.userContractAddress) &&
                    typeof this.state.docContract === "object") {
                    let eventFilters = {fromBlock: 0, address: this.state.userContractAddress};
                    console.log("Attempt Event Emitter Instantiation");
                    let StoreDoc = await this.state.docContract.events.StoreDoc({}, eventFilters, this.storeEvent);
                    this.setState({docEventEmitter: StoreDoc});
                    console.log(this.state.docEvents);
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    async storeEvent(error, eventResult){
        if (error)
            console.log('Error in myEvent event handler: ' + error);
        else {
            console.log("New Blockchain Event Being Recorded");
            let eventObject = (({ _author, _docName, _docHash }) => ({ _author, _docName, _docHash }))(eventResult.returnValues);
            let events = this.state.docEvents;
            events.push(eventObject);
            this.setState({docEvents:events});
            console.log(this.state.docEvents);
        }
    }

    async componentDidMount() {
        let loginSuccess = false;
        // Non Legacy Browsers
        if (window.ethereum) {
            let ethereum = window.ethereum;
            try {
                await ethereum.enable();
                window.web3 = new Web3(ethereum);
                loginSuccess = true;
            } catch (e) {
                console.log(e)
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            try {
                window.web3 = new Web3(window.web3.currentProvider);
                loginSuccess = true;
            } catch (e) {
                console.log(e);
            }
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }

        //Determine if app was authorized
        if (loginSuccess === true) {
            try {
                let accts = await window.web3.eth.getAccounts();
                let acct = accts[0];
                let networkVersion = await window.web3.eth.net.getId();
                this.setState({Web3State: "Authorized", acct: acct, networkVersion: networkVersion.toString()});
                window.web3.currentProvider.publicConfigStore.on('update', this.handleMetaMaskChanges);
            }
            catch (e) {
                console.log(e);
            }
        }
        //Set State Watching Process in Motion
        if (window.web3 || window.ethereum){ this.timerID = setInterval(() => this.tick(), 2000);}
        //Determine if user has their own document contract and update state
        if (this.state.Web3State === "Authorized"){ await this.iniateDocumentAccess(); }
    }

    componentWillUnmount() {
        if (this.timerID !== "undefined"){
            clearInterval(this.timerID);
        }

        if (typeof this.state.docEventEmitter === "object"){
            try{
                this.state.docEventEmitter.removeAllListeners();
            } catch (e){
                console.log(e);
            }
        }
    }

    ///Tick function checks up on changes in environment and updates state to reflect that.\
    async tick(){
        let accts = await window.web3.eth.getAccounts();
        if ((typeof accts === "undefined") || ((typeof accts === 'object') && (accts.length === 0))) {
            this.setState({Web3State:"LoggedOut", acct:undefined})
        }
        else if ((typeof accts === 'object') && (accts.length > 0) && this.state.Web3State !== "Authorized") {
            this.setState({Web3State:"Authorized", acct:undefined})
        }
        if (this.state.actionState === "contractDeployFailed"){
            setTimeout(this.setState({actionState:undefined}), 2000);
        }
        if (window.ethereum && this.state.Web3State === "Unauthorized"){
            try {
                let accts = await window.web3.eth.getAccounts();
                let acct = accts[0];
                if (typeof acct === "string"){
                    this.setState({Web3State:"Authorized", acct:acct});
                }
            } catch (e) {
                console.log(e);
            }

        }
        if (window.web3.utils.isAddress(this.state.userContractAddress)
            && this.state.userContractAddress !== nullAddress
            && typeof this.state.docEventEmitter !== "object") {
                this.iniateDocumentAccess(false, true);
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
                    <DocForm acct={this.state.acct} Web3State={this.state.Web3State} networkVersion={this.state.networkVersion}
                    userContractAddress = {this.state.userContractAddress} actionState={this.state.actionState}
                             createDocStorageContract={this.createDocStorageContract}/>
                    <h2>Your Existing Documents</h2>
                    <ExistingDocTable docEvents={this.state.docEvents}/>
                </div>
            );
        }
    }
}


export default Web3Gateway;