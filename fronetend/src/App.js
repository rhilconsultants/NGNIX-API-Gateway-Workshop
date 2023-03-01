import { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';



function App(_res,_req) {
  const [title] = useState(`${window._env_.API_URL}`);
  useEffect(() => {
    // This will run when the page first loads and whenever the title changes
    document.title = title;
  },
  [title]);
  return (   
    <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Message: {window._env_.API_URL}
          </p>
          <p>
            HOST: {window._env_.HOSTNAME}
          </p>
          <a
            className="link"
            href="/backend1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Test backend 1
          </a>
          <a
            className="link"
            href="/backend2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Test backend 2
          </a>
        </header>
      </div>
  );
}

export default App;
