import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

import config from './config'

class Firebase {
    constructor() {
        app.initializeApp(config)

        this.auth = app.auth()
        this.db = app.database()
    }

    //authentication & authorization api
    doCreateUserWithEmailAndPassword = (email, password) => this.auth.createUserWithEmailAndPassword(email, password)
    doSignInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password)
    doSignOut = () => this.auth.signOut()
    doPasswordReset = email => this.auth.sendPasswordResetEmail(email)
    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password)

    //users api
    user = uid => this.db.ref(`users/${uid}`)
    users = () => this.db.ref('users')

    //messages api
    message = () => this.db.ref('messages').push()
    messages = () => this.db.ref('messages')
}

export default Firebase