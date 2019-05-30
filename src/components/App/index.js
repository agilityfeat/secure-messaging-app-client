import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import {compose} from 'recompose'

import Navigation from '../Navigation'
import SignUpPage from '../SignUp'
import SignInPage from '../SignIn'
import PasswordForgetPage from '../PasswordForget'
import AccountPage from '../Account'
import ChatRoomPage from '../ChatRoom'

import * as ROUTES from '../../constants/routes'
import { withAuthentication } from '../Session'
import { withEThree } from '../EThree'

const App = () => (
  <Router>
    <div>
      <Navigation />
      <hr />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.CHAT_ROOM} component={ChatRoomPage} />
    </div>
  </Router>
)

export default compose(
  withAuthentication,
  withEThree
  )(App)
