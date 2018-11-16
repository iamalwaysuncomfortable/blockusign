import React, { Component } from 'react';
import logo from './logo.svg';
import FancyBorder from './demo_components/header';
import BodyText from './demo_components/Bodytext';
import './App.css';



class App extends Component {
  render() {
    return (
      <div className="App">
        <FancyBorder/>
        <BodyText/>
      </div>
    );
  }
}

export default App;
