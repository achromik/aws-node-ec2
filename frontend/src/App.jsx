import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';

const App = () => (
  <div>
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <div className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/register" className="nav-link">
            Sign Up
          </Link>
        </li>
      </div>
    </nav>
    <div className="container mt-3">
      <Switch>
        <Route exact path={['/', '/home']} component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/profile" component={Profile} />
        {/* <Route path="/user" component={BoardUser} />
          <Route path="/mod" component={BoardModerator} />
          <Route path="/admin" component={BoardAdmin} /> */}
      </Switch>
    </div>
  </div>
);

export default App;
