import React from "react";
import {InputText} from "primereact/inputtext";
import {InputTextarea} from 'primereact/inputtextarea';
import {Button} from 'primereact/button';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
const nullAddress = "0x0000000000000000000000000000000000000000";
const networkNameTable = {'1':'mainnet', '3':'roposten', '4':'rinkeby','42':'kovan'};



class DocForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {docTitle:'', author:'', content:''};
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.forceUpdate();
    }

    handleSubmit(e){
        e.preventDefault();
    }

    render(){
        let buttonSet;
        let docList;
        console.log(this.props.Web3State);
        if (this.props.Web3State === "Authorized") {
            if (this.props.networkVersion in networkNameTable) {
                if (this.props.userContractAddress !== nullAddress){
                    buttonSet = (
                        <div>
                            <Button type="submit" label="Verify Document" className="p-button-raised" onClick={this.props.verifyDoc}  id="verify"/>
                            <Button type="submit" label="Add New Document" className="p-button-raised" onClick={this.props.addDoc} id="add"/>
                        </div>
                    );
                }
                else{
                    if (this.props.actionState === "contractDeployFailed"){
                        buttonSet = <Button label="Contract Deployment Failed"  className="p-button-danger"/>
                    }
                    else if (this.props.actionState === "attemptContractDeploy" || this.props.actionState === "AwaitingContractDeploy"){
                        buttonSet = <Button label="Attemping To Create Your Account.."  className="p-button-raised"/>
                    }
                    else {
                        buttonSet = <Button label="Create Your Document Storage Account on the Ethereum Blockchain!"
                                            onClick={this.props.createDocStorageContract} className="p-button-raised"/>
                    }
                }
            }
            else {
                console.log(this.props.networkVersion);
                buttonSet = <Button label="Chosen Ethereum Network not recognized, please choose rinkeby, kovan, ropsten, or mainnet" className="p-button-warning"/>
            }
        }
        else if (this.props.Web3State === "LoggedOut"){
            buttonSet = <Button label="You've been logged out of metamask, please log back in before proceeding" className="p-button-warning"/>
        }
        else{
            buttonSet = <Button label="Please Login to a Dapp Browser and Authorize This Application Before Proceeding" className="p-button-warning" onClick={this.props.attemptLogin}/>
        }

        return(
            <form className="Doc-container" onSubmit={this.handleSubmit}>
                <div className="p-col-12 p-md-4">
                    <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"/>
                                </span>
                        <InputText id="author" placeholder="Author Name" value={this.props.author} onChange={this.props.handleFormChange} />
                    </div>
                </div>

                <div className="p-col-12 p-md-4">
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-file"/>
                        </span>
                        <InputText id="title" placeholder="Document Title" value={this.props.title} onChange={this.props.handleFormChange} />
                    </div>
                </div>

                <div className="p-inputgroup">
                    <InputTextarea id ="content" rows={5} cols={30} value={this.props.content} onChange={this.props.handleFormChange} autoResize={true} />
                </div>
                {buttonSet}
            </form>
        );
    }

}

export default DocForm;