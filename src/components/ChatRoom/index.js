import React, { Component } from 'react'
import { withFirebase } from '../Firebase';
import AuthUserContext from '../Session/context';
import { withAuthorization } from '../Session';
import { EThreeContext } from '../EThree'

const ChatRoom = () => (
    <div>
        <h1>Messages</h1>
        <AuthUserContext.Consumer>
            {authUser => (
                <EThreeContext.Consumer>
                    {eThreePromise => (
                        <div>
                            <ChatForm authUser={authUser} eThreePromise={eThreePromise} />
                            <Messages eThreePromise={eThreePromise} />
                        </div>

                    )}
                </EThreeContext.Consumer>
            )
            }
        </AuthUserContext.Consumer>

    </div>
)

const CHATFORM_INITIAL_STATE = {
    message: '',
    error: null
}

class ChatFormBase extends Component {
    constructor(props) {
        super(props)
        this.state = { ...CHATFORM_INITIAL_STATE }
    }

    onSubmit = event => {

        const { message } = this.state
        const { authUser, eThreePromise } = this.props

        this.props.firebase.users().once('value', async snapshot => {
            const userObject = snapshot.val()
            const userList = Object.keys(userObject)
            console.log('encrypting for users', userList)
            const eThree = await eThreePromise
            const publicKeys = await eThree.lookupPublicKeys(userList)
            const encryptedMessage = await eThree.encrypt(message, publicKeys)
            this.props.firebase
                .message()
                .set({
                    message: encryptedMessage,
                    sender: authUser.uid
                })
                .then(() => {
                    this.setState({ ...CHATFORM_INITIAL_STATE })
                })
                .catch(error => {
                    this.setState({ error })
                })
        })

        event.preventDefault()
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    render() {
        const { message, error } = this.state
        const isInvalid = message === ''

        return (
            <form onSubmit={this.onSubmit}>
                <input
                    name="message"
                    value={message}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Type a message here" />
                <button disabled={isInvalid} type="submit">
                    Send
                </button>

                {error && <p>{error.message}</p>}
            </form>
        )
    }
}

const ChatForm = withFirebase(ChatFormBase)

class MessagesBase extends Component {
    constructor(props) {
        super(props)

        this.state = {
            messages: []
        }
    }

    componentDidMount() {
        this.setState({ loading: true })
        const { authUser, eThreePromise } = this.props

        eThreePromise.then(async eThree => {

            this.props.firebase.messages().on('value', snapshot => {
                const messageObject = snapshot.val() || {}

                const messageListPromise = Object.keys(messageObject).map(async key => {
                    const publicKey = await eThree.lookupPublicKeys(messageObject[key].sender)
                    const decryptedMessage = await eThree.decrypt(messageObject[key].message, publicKey)
                    const userSnapshot = await this.props.firebase.user(messageObject[key].sender).once('value')
                    return {
                        uid: key,
                        decryptedMessage: decryptedMessage,
                        user: (userSnapshot.val() && userSnapshot.val().username) || 'Anonymous'

                    }   
                })

                Promise.all(messageListPromise).then(messageList => {
                    this.setState({
                        messages: messageList
                    })
                })
            })
        })
    }

    componentWillUnmount() {
        this.props.firebase.messages().off()
    }

    render() {
        const { messages } = this.state

        return (
            <div>
                {messages.map(message => (
                    <div key={message.uid}>
                        <span>
                            <strong>{message.user}</strong>
                        </span>
                        <span>
                            <p>{message.decryptedMessage}</p>
                        </span>
                    </div>
                ))}
            </div>
        )
    }
}

const Messages = withFirebase(MessagesBase)

const condition = authUser => !!authUser

export default withAuthorization(condition)(ChatRoom)