import AdminContractData from '../abis/DocStoreAdmin';
import DocContractData from '../abis/DocStore';
import NoDappBrowser from "./NoWeb3";
import BodyText from "./Bodytext";
import DocForm from "./DocForm";
import ExistingDocTable from "./ExistingDocTable";
import {ProgressBar} from 'primereact/progressbar';
import {Messages} from 'primereact/messages';
import {Message} from 'primereact/message';
import React from "react";
import Web3 from "web3";
const sha256 = require('sha256');
const adminAbi = JSON.parse(AdminContractData.abi);
const docStoreAbi = JSON.parse(DocContractData.abi);
const rinkebyAdminAddress = '0x4469dd74B6b7A128656ACAA12eA50aA28DdFC7Ca';
const kovanAdminAddress = '0x558c704f255Da2cAf479133c122236bEb2942641';
const ropstenAdminAddress = '0x379aD71d2FbD3C095Cb4b3bdf95Bfd3fF12d76F8';
const nullAddress = "0x0000000000000000000000000000000000000000";
const networkLookupTable = {'1':undefined, '3':ropstenAdminAddress, '4':rinkebyAdminAddress,'42':kovanAdminAddress};

class Web3Gateway extends React.Component{

    constructor(props){
        super(props);
        this.state = {acct:undefined, Web3State:"Unauthorized", adminContract: undefined,
            networkVersion:undefined, userContractAddress:nullAddress, actionState:undefined,
            docEventEmitter:undefined, docEvents:[], docContract:undefined, name:'', author:'', content:''};
        this.tick = this.tick.bind(this);
        this.handleMetaMaskChanges = this.handleMetaMaskChanges.bind(this);
        this.createDocStorageContract = this.createDocStorageContract.bind(this);
        this.iniateDocumentAccess = this.iniateDocumentAccess.bind(this);
        this.storeEvent = this.storeEvent.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.verifyDoc = this.verifyDoc.bind(this);
        this.addDoc = this.addDoc.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
        this.showError = this.showError.bind(this);
        this.attemptLogin = this.attemptLogin.bind(this);
    }

    showSuccess(message) {
        this.messages.show({severity: 'success', summary: 'Success Message', detail: message});
    }

    showError(message) {
        this.messages.show({severity: 'error', summary: 'Error Message', detail: message});
    }

    handleFormChange(e){
        console.log(e.target);
        switch (e.target.id){
            case "author":
                this.setState({author: e.target.value});
                break;
            case "title":
                this.setState({title: e.target.value});
                break;
            case "content":
                this.setState({content: e.target.value});
                break;
        }
    }

    async verifyDoc(e){
        let userContractAddress = this.state.userContractAddress;
        let docHash = '0x' + sha256(this.state.content + this.state.title + this.state.author);
        if (window.web3.utils.isAddress(userContractAddress) && userContractAddress !== nullAddress){
            let docStore = await new window.web3.eth.Contract(docStoreAbi, userContractAddress);
            let isInDoc = await docStore.methods.verifyDocHash(docHash).call({from: this.state.acct});
            console.log(isInDoc);
            if (isInDoc === true)
                this.showSuccess("Document already stored in the blockchain!");
            else
                this.showError("Document hasn't yet been stored in the blockchain!");
        }
    }

    async addDoc(e){
        let userContractAddress = this.state.userContractAddress;
        let docHash = '0x' + sha256(this.state.content + this.state.title + this.state.author);
        if (window.web3.utils.isAddress(userContractAddress) && userContractAddress !== nullAddress){
            let docStore = await new window.web3.eth.Contract(docStoreAbi, userContractAddress);
            let isInDoc = await docStore.methods.verifyDocHash(docHash).call({from: this.state.acct});
            console.log(isInDoc);
            if (isInDoc === true){
                this.showError("Document already in the blockchain!");
            } else {
                try {
                    this.setState({actionState:"AttemptDocSubmit"});
                    let transactionReceipt = await docStore.methods.addNewDoc(docHash, this.state.title, this.state.author).send({
                        from: this.state.acct,
                        gas: 1000000
                    });
                    this.setState({actionState:undefined});
                    this.showSuccess("Document stored successfully in the blockchain!\n " +
                        "Records will updated in the next block");
                    console.log(transactionReceipt)
                } catch (e){
                    this.setState({actionState:"DocSubmitFailed"});
                    this.showError("Submission to the blockchain failed!");
                    console.log(e);
                }

            }

        }
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
            this.setState({actionState:"AwaitingContractDeploy"})
        }
        catch (e) {
            console.log(e);
            this.setState({actionState:undefined});
            this.showError("Account Creation on the Ethereum Blockchain Failed")
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

    async attemptLogin(){
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
                if (typeof accts !== "undefined" && accts.length > 0) {
                    this.setState({Web3State: "Authorized", acct: acct, networkVersion: networkVersion.toString()});
                    window.web3.currentProvider.publicConfigStore.on('update', this.handleMetaMaskChanges);
                }
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

    async componentDidMount() {
        await this.attemptLogin();
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
        if ((typeof accts === 'undefined' || accts.length === 0) && this.state.Web3State === "Authorized") {
            this.setState({Web3State:"UnAuthorized", acct:undefined})
            this.setState({docEvents:[]})
        }
        if ((typeof accts === 'object') && (accts.length > 0) && this.state.Web3State !== "Authorized") {
            this.setState({Web3State:"Authorized", acct:undefined})
        }
        if (this.state.actionState === "contractDeployFailed" || this.state.actionState === "DocSubmitFailed"){
            setTimeout(this.setState({actionState:undefined}), 2000);
        }
        if (window.ethereum && this.state.Web3State === "Unauthorized"){
            try {
                let accts = await window.web3.eth.getAccounts();
                if (typeof accts !== "undefined" && accts.length > 0){
                    console.log(accts)
                    this.setState({Web3State:"Authorized", acct:accts[0]});
                }
            } catch (e) {
                console.log(e);
            }
        }
        if (this.state.actionState==="AwaitingContractDeploy"){
            try {
                let userContractAddress = await this.state.adminContract.methods.checkIfUserHasStorageContract().call({from: this.state.acct});
                if (userContractAddress !== nullAddress) {
                    this.setState({userContractAddress: userContractAddress, actionState: undefined});
                    this.showSuccess("Document Storage Account Created on the Ethereum Blockchain")
                }
            } catch (e) {
                console.log(e);
            }

        }

        if (window.web3.utils && window.web3.utils.isAddress(this.state.userContractAddress)
            && this.state.userContractAddress !== nullAddress
            && typeof this.state.docEventEmitter !== "object") {
                this.iniateDocumentAccess(false, true);
            }
    }

    render(){

        let DocSubmitStatus;
        if (typeof window.web3 === "undefined") {
            console.log(window.web3);
            return(
                <div className="main-div">
                    <NoDappBrowser/>
                </div>);
        }
        else {
            if (this.state.actionState === "AttemptDocSubmit" || this.state.actionState === "attemptContractDeploy"){
                let text;
                if (this.state.actionState === "AttemptDocSubmit") { text = "Submitting Your Doc to the Ethereum Blockchain!"}
                if (this.state.actionState === "attemptContractDeploy" || this.state.actionState === "AwaitingContractDeploy") {
                    text = "Attempting to Create Your Document Storage Account!"
                }
                DocSubmitStatus = (
                  <div className="Bodytext-style-eth-div">
                      <text>{text}</text>
                      <div>
`                      <ProgressBar mode="indeterminate" />
                      </div>
                  </div>
                );
            }
            return(
                <div className="main-div">

                    <BodyText/>
                    <DocForm acct={this.state.acct} Web3State={this.state.Web3State} networkVersion={this.state.networkVersion}
                    userContractAddress = {this.state.userContractAddress} actionState={this.state.actionState}
                             createDocStorageContract={this.createDocStorageContract} author={this.state.author}
                             title={this.state.title} content={this.state.content} handleFormChange={this.handleFormChange}
                             addDoc = {this.addDoc} verifyDoc={this.verifyDoc} attemptLogin = {this.attemptLogin} />
                    <Messages ref={(el) => this.messages = el} />
                    {DocSubmitStatus}
                    <h2>Your Existing Documents</h2>
                    <ExistingDocTable docEvents={this.state.docEvents}/>
                </div>
            );
        }
    }
}


export default Web3Gateway;