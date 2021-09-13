import React, { useEffect, useState } from 'react';
import Viewer from './Components/Viewer/viewer';
import TopBar from './Components/TopBar/topBar';
import { Provider } from 'react-redux';
import 'tachyons';
import './index.css';
import configureStore from './store';
import Socket from './socketHelper';
import UsersContainer from './Components/UsersContainer/usersContainer';
import { changeCalibrationStatus } from './Actions/roomActions';
import { setUsername } from './Actions/roomActions';
import 'animate.css';
import UsernameModal from './Components/UsernameModal/usernameModal';
const store = configureStore();

const App = () => {
    // let name = 'user' + Math.floor(Math.random() * 100 + 1);
    let room = 'test';
    const [socket, setSocket] = useState(null);
    const [isUsernameSet, setIsUsernameSet] = useState(false);

    useEffect(() => {
        window.electronapi.addFunctionToMapping('handle-calibration', () =>
            store.dispatch(changeCalibrationStatus(true))
        );
    }, []);

    const confirmUsername = (username) => {
        setIsUsernameSet(true);
        store.dispatch(setUsername(username));
        setSocket(Socket(room, store).joinRoom(room));
    };

    return (
        <Provider store={store}>
            {isUsernameSet == false ? (
                <UsernameModal confirmUsername={confirmUsername} />
            ) : (
                <div>
                    <UsersContainer />
                    <TopBar />
                    <Viewer />
                </div>
            )}
        </Provider>
    );
};

export default App;
