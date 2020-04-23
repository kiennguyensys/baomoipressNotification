import React, { Component } from "react";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Switch, BrowserRouter, Route } from 'react-router-dom';
import SignIn from './screens/SignIn';
import Panel from './screens/Panel';
import NotificationCenter from './screens/NotificationCenter';
import NotificationCron from './screens/NotificationCron';
import ScheduleHistory from './screens/ScheduleHistory';
import PrivateRoute from './components/PrivateRoute';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                  <Route path="/sign-in" component={SignIn} />
                  <PrivateRoute path="/notification-cron" component={NotificationCron} />
                  <PrivateRoute path="/schedule-history" component={ScheduleHistory} />
                  <PrivateRoute path="/notification-sender" component={NotificationCenter} />
                  <PrivateRoute path="/" component={Panel} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
