import React, { Component } from "react";
import { Link, Route, Switch, BrowserRouter } from 'react-router-dom';
import "../../pages/style/Home.css";

import Home from '../../pages/Home';
import Login from '../../pages/Login';
import Registration from '../../pages/Registration';
import Logout from '../../pages/Logout';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            isAdmin: false,
            items: {},
            isLoggedIn:false,
            firstname: '',
            lastname: '',
            refreshed: true
        };

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.setName = this.setName.bind(this);
        this.setAdmin = this.setAdmin.bind(this);
    }

    login() {
        this.setState({isLoggedIn: true});
    }

    logout() {
        this.setState({isLoggedIn: false});
    }

    setName(name) {
        this.setState(name);
    }

    setAdmin(isAdmin) {
        this.setState({isAdmin: isAdmin});
    }

    componentDidMount() {
        fetch('/api/checkToken', {
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 200) {
                this.setState({
                    msg: "USER LOGGED IN!",
                    isLoggedIn:true,
                    loading:false
                });
                return res.json();
            } else {
                this.setState({
                    msg: "PLEASE LOGIN FIRST.",
                    isLoggedIn:false,
                    loading:false
                });
            }
        })
        .then(data => {
            if (data) {
                //console.log(data);
                this.setState({
                    firstname: data.firstname,
                    lastname: data.lastname
                });
                this.setState({isAdmin: data.isAdmin});
            }
            
        }) 
        .catch(err => {
            console.error(err);
            alert('Error checking token');
        });
        
    }

    render() {
        var loginButton = this.state.isLoggedIn ? (<div className='nav-item'><Link to="/logout">Logout</Link></div>) : (<div><div className='nav-item'><Link to="/login">Login</Link></div><div className='nav-item'><Link to="/register">Register</Link></div></div>);

        return (
            <BrowserRouter>
                <div className='container'>
                    <div className='nav'>
                        <div className='logo'>LOGO</div>
                        <div className='nav-cont'>
                            {this.state.isAdmin ?
                                <div className='admin-tag'>A</div>
                            :
                                <span></span>
                            }
                            <div className='firstname'>{this.state.firstname}</div>
                            <div className='lastname'>{this.state.lastname}</div>
                            <div className='nav-item'><Link to="/">Home</Link></div>
                            {loginButton}
                        </div>
                    </div>
                    <div className='content'>
                        <Switch>
                            <Route exact path="/" component={() => <Home login={this.login} logout={this.logout} setName={this.setName} setAdmin={this.setAdmin}/>} />
                            <Route exact path="/login" component={() => <Login login={this.login} logout={this.logout}  setName={this.setName} setAdmin={this.setAdmin}/>} />
                            <Route exact path="/logout" component={() => <Logout login={this.login} logout={this.logout}  setName={this.setName} setAdmin={this.setAdmin}/>} />
                            <Route exact path="/register" component={() => <Registration login={this.login} logout={this.logout} setName={this.setName} setAdmin={this.setAdmin}/>} />
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;