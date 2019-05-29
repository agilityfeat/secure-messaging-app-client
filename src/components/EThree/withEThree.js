import React from 'react'
import { EThree } from '@virgilsecurity/e3kit'

import { withFirebase } from '../Firebase'
import EThreeContext from './context'

const withEThree = Component => {
    class WithEThree extends React.Component {
        constructor(props) {
            super(props)

            this.state = {
                eThreePromise: null
            }
        }

        async fetchToken(authToken) {
            const response = await fetch(
            "https://us-central1-virgiltake2.cloudfunctions.net/api/virgil-jwt",
            {
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                })
            },
            );
            if (!response.ok) {
                throw new Error(`Error code: ${response.status} \nMessage: ${response.statusText}`);
            }
            return response.json().then(data => data.token);
        };

        componentDidMount() {
            let eThreePromise = new Promise((resolve, reject) => {
                this.props.firebase.auth.onAuthStateChanged(user => {
                    if (user) {
                        const getToken = () => user.getIdToken().then(this.fetchToken);
                        console.log('Initializaing Ethree with token')
                        eThreePromise = EThree.initialize(getToken);
                        console.log('new promise value', eThreePromise)
                        eThreePromise.then(resolve).catch(reject);
                    }
                });
            });
            this.setState({eThreePromise})
        }

        render() {
            return (
                <EThreeContext.Provider value={this.state.eThreePromise}>
                    <Component {...this.props} />
                </EThreeContext.Provider>
            )
        }
    }

    return withFirebase(WithEThree)
}

export default withEThree