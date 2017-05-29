import * as React from 'react';
import { store, history } from './shared/store/store';
import { Provider } from 'react-redux';
import { ConnectedRouter as Router } from 'react-router-redux';
import { Route, Switch } from 'react-router';
import Rooms from './rooms/rooms';
import Room from './room/room';
import SignIn from './sign-in/sign-in';
import PrivateRoute from './shared/router/private-route';
import 'font-awesome/css/font-awesome.css';

// const onClick = (path: string) => {
//   store.dispatch(push(path));
// };

const App = () => (
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <PrivateRoute exact={true} path="/" component={Rooms}/>
        <Route path="/sign-in" component={SignIn}/>
        <PrivateRoute path="/room/:id" component={Room}/>
        <Route render={() => <h1>404 mate.</h1>}/>
      </Switch>
    </Router>
  </Provider>
);

export default App;
