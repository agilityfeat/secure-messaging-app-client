import React, {Component} from 'react'
import { withFirebase } from '../Firebase';
import AuthUserContext from '../Session/context';
import { withAuthorization } from '../Session';

const ChatRoom = () => (
    <div>
        <h1>Messages</h1>
        <Messages />
        <AuthUserContext.Consumer>
            {authUser => (
                <ChatForm authUser={authUser} />
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
        const { authUser } = this.props

        this.props.firebase
            .message()
            .set({
                message: message,
                sender: authUser.email
            })
            .then(() => {
                this.setState({ ...CHATFORM_INITIAL_STATE })
            })
            .catch(error => {
                this.setState({ error })
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

        this.props.firebase.messages().on('value', snapshot => {
            const messageObject = snapshot.val() || {}

            const messageList = Object.keys(messageObject).map(key => ({
                ...messageObject[key],
                uid: key
            }))

            this.setState({
                messages: messageList
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
                            <strong>{message.sender}</strong>
                        </span>
                        <span>
                            <p>{message.message}</p>
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