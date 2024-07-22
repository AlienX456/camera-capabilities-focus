import logo from './logo.svg';
import React from 'react'
import './App.css';


class App extends React.Component {
  imageCapture;
  currentFocusMode = "";
  capabilitiesFocusMode = [];
  track = null;
  constructor(props) {
    super(props);
    this.state = {
      focusMode: [],
      hidden: true
    };
  }


  async getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: {
        facingMode: 'environment'
      }});
      const video = document.querySelector('video');
      video.srcObject = stream;
  
      [this.track] = stream.getVideoTracks();
      this.imageCapture = new ImageCapture(this.track);
  
      const capabilities = this.track.getCapabilities();
      const settings = this.track.getSettings();
  
      console.log("Capabilities: ", capabilities);
      console.log("Settings: ", settings);
      if (!capabilities.focusDistance) {
        return;
      }
      this.capabilitiesFocusMode = capabilities.focusMode;
      // Map focus distance to a slider element.
      const input = document.querySelector('input[type="range"]');
      input.min = capabilities.focusDistance.min;
      input.max = capabilities.focusDistance.max;
      input.step = capabilities.focusDistance.step;
      input.value = settings.focusDistance;
      input.oninput = async event => {
        try {
          await this.track.applyConstraints({
            focusDistance: input.value
          });
          console.log("applyConstraints() correct");
        } catch (err) {
          console.error("applyConstraints() failed: ", err);
        }
      };
    } catch (err) {
      console.error(err);
    }
  }

  createSelectItems(focusModes) {    
    let items = [];   
    for (let i = 0; i < focusModes.length; i++) {         
        items.push(<option key={focusModes[i]} value={focusModes[i]}>{focusModes[i]}</option>);   
    }
    console.log("items: ", items);
    return items;
  }
  
  onDropdownSelected(e) {
    this.currentFocusMode = e.target.value;
    try {
      this.track.applyConstraints({
        focusMode: this.currentFocusMode
      });
      console.log("applyConstraints() correct");
    } catch (err) {
      console.error("applyConstraints() failed: ", err);
    }

    if (this.currentFocusMode == "manual") {
      this.setState({hidden: false});
    } else {
      this.setState({hidden: true});
    }
  }

  loadFocusModes() {
    this.setState({focusMode: this.createSelectItems(this.capabilitiesFocusMode)})
    this.currentFocusMode = this.capabilitiesFocusMode[0];
    try {
      this.track.applyConstraints({
        focusMode: this.currentFocusMode
      });
      console.log("applyConstraints() correct");
    } catch (err) {
      console.error("applyConstraints() failed: ", err);
    }

    if (this.currentFocusMode == "manual") {
      this.setState({hidden: false});
    } else {
      this.setState({hidden: true});
    }
  }
    
  
  render() {
    this.getMedia();
    return (
      <div className="App">
        <video autoPlay></video>
        <img/>
        <input type="range" hidden={this.state.hidden}/>
        <button onClick={this.loadFocusModes.bind(this)}>Load capabilities</button>
        <select onChange={this.onDropdownSelected.bind(this)} label="Multiple Select">
          {this.state.focusMode}
        </select>
      </div>);
  }
}


export default App;
