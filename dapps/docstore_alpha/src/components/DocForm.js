import React from "react";
import {InputText} from "primereact/inputtext";
import {InputTextarea} from 'primereact/inputtextarea';
import {Button} from 'primereact/button';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';




class DocForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {docTitle:'', author:'', content:''};
        this.submitDoc = this.handleSubmit.bind(this);
    }

    handleSubmit(e){
        console.log(e)
    }

    componentWillReceiveProps(nextProps) {
        this.forceUpdate();
    }

    render(){
        let buttonSet;
        console.log(this.props.Web3State);
        if (this.props.Web3State === "Authorized") {
            buttonSet = <Button label="Proceed" className="p-button-raised"/>
        }
        else if (this.props.Web3State === "LoggedOut"){
            buttonSet = <Button label="You've been logged out of metamask, please log back in before proceeding" className="p-button-warning"/>
        }
        else{
            buttonSet = <Button label="Please Login to a Dapp Browser Before Proceeding" className="p-button-warning"/>
        }

        return(


            <form onSubmit={this.handleSubmit} className="Doc-container">
                <div className="p-col-12 p-md-4">
                    <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"/>
                                </span>
                        <InputText placeholder="Author Name" value={this.state.author} onChange={(e) => this.setState({author: e.target.author})} />
                    </div>
                </div>

                <div className="p-col-12 p-md-4">
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-file"/>
                        </span>
                        <InputText placeholder="Document Title" value={this.state.docTitle} onChange={(e) => this.setState({docTitle: e.target.docTitle})} />
                    </div>
                </div>

                <div className="p-inputgroup">
                    <InputTextarea rows={5} cols={30} value={this.state.content} onChange={(e) => this.setState({content: e.target.content})} autoResize={true} />
                </div>
                {buttonSet}
            </form>
        );
    }

}

export default DocForm;