import React from "react";

class DocForm extends React.Component{
    constructor(props){
        super(props);
        this.submitDoc = this.handleSubmit.bind(this);
    }

    submitDoc(e){
        alert('Text submitted was: ' + this.state.value);
        e.preventDefault();
    }

}