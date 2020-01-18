import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

import './App.css';



const address = "https://gentle-scrubland-05891.herokuapp.com/"

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

const initialState = {
  
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


class App extends Component {
  constructor() {
    super()
    this.state = initialState
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
    // console.log(data)
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
    
    fetch(`${ address }imageurl`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          input: this.state.input
      })
    }).then(data => {
      return data.json()
    })
      .then(response => {
        if(response) {
          fetch(`${ address }image`, {
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
          .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(error => console.log(error));
  }

  onRouteChange = (route) => {

    if (route === 'home') {
      this.setState({ isSignedIn: true })
    } else if ( route === 'signout') {
      this.setState(initialState)
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
              loadUser={ this.loadUser }
              address={ address }/>
          : <Register 
              onRouteChange={ this.onRouteChange } 
              loadUser={ this.loadUser }
              address={ address }/>
        )
        
        }

      

      </div>
    );
  }
  
}

export default App;
