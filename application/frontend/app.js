import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import axios from 'axios';

function App() {
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');

  const handleButton1Click = async () => {
    const res = await axios.get('/backend1');
    setResponse1(res.data);
  };

  const handleButton2Click = async () => {
    const res = await axios.get('/backend2');
    setResponse2(res.data);
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/">
            <Home 
              handleButton1Click={handleButton1Click}
              handleButton2Click={handleButton2Click}
              response1={response1}
              response2={response2}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home({ handleButton1Click, handleButton2Click, response1, response2 }) {
  return (
    <div>
      <h1>Hello World</h1>
      <button onClick={handleButton1Click}>Get response from backend 1</button>
      <button onClick={handleButton2Click}>Get response from backend 2</button>
      <p>Response from backend 1: {response1}</p>
      <p>Response from backend 2: {response2}</p>
    </div>
  );
}

export default App;
