import React, { Component } from 'react';
import logo from './logo.svg';
import FancyBorder from './components/header';
import Web3Gateway from './components/Web3Gateway';
import './App.css';




class App extends Component {
  
  componentDidMount() {
    document.title = "BlockUSign Proof of Authorship";
  }
  
  render() {
    return (
      <div className="App">
        <FancyBorder/>
          <div className="main-div">
              <Web3Gateway/>
          </div>
      </div>
    );
  }
}

export default App;
