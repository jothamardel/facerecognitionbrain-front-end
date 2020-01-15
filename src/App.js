import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

import './App.css';


const app = new Clarifai.App({
  apiKey: '0124e25ee74f495f8d426b49219d797e'
 });

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 200
      }
    }
  }
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: ""
      }
    }

  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    const width = Number(image.width)
    const height = Number(image.height)

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {

    this.setState({ imageUrl: this.state.input })
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        if(response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }))
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(error => console.log(error));
  }

  onRouteChange = (route) => {

    if (route === 'home') {
      this.setState({ isSignedIn: true })
    } else if ( route === 'signout') {
      this.setState({ isSignedIn: false })
    } 


    this.setState({route})
  } 

  render () {

    const { isSignedIn, route, box, imageUrl } = this.state;

    return (
      <div className="App">

      <Particles className='particles'params={ particlesOptions }/>

      <Navigation onRouteChange={ this.onRouteChange } isSignedIn={ isSignedIn }/>
      

        { route === 'home'

        ? 
             
        <>
        <Logo />
    
        <Rank 
          name = {this.state.user.name }
          entries = { this.state.user.entries }/>
        
        <ImageLinkForm onInputChange={ this.onInputChange } onButtonSubmit={ this.onButtonSubmit } />
      
        <FaceRecognition box={ box } imageUrl={ imageUrl }/>
        </>

        :

        (
          route === 'signin' 
          ? <Signin 
              onRouteChange={ this.onRouteChange }
              loadUser={ this.loadUser }/>
          : <Register 
              onRouteChange={ this.onRouteChange } 
              loadUser={ this.loadUser }/>
        )
        
        }

      

      </div>
    );
  }
  
}

export default App;