import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Toggle from './demo_components/Control';
import {NumberList, StringList} from './demo_components/NumberList';
import * as serviceWorker from './serviceWorker';
import {BasicForm, EssayForm} from "./demo_components/Forms";

//import web3 from './web3';



const n = [1,2,3,4,5];
const s = ["Vilma", "Angela", "Eileen", "Mimi"];
ReactDOM.render(
    <EssayForm />, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
