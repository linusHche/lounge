import React, { useEffect, useState } from 'react';
import Viewer from './Components/Viewer';
import TopBar from './Components/TopBar';
import { Provider } from 'react-redux';
import 'tachyons';
import './index.css';
import configureStore from './store';
import Socket from './socketHelper';
import UsersContainer from './Components/UsersContainer';
import { changeCalibrationStatus } from './Actions/roomActions';
import { setUsername } from './Actions/roomActions';
import 'animate.css';
const store = configureStore();

const App = () => {
    let name = 'user' + Math.floor(Math.random() * 100 + 1);
    let room = 'test';
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        store.dispatch(setUsername(name));
        window.electronapi.addFunctionToMapping('handle-calibration', () =>
            store.dispatch(changeCalibrationStatus(true))
        );
        setSocket(Socket(room, store).joinRoom(room));
    }, []);

    return (
        <Provider store={store}>
            <div>
                <UsersContainer />
                <TopBar />
                <Viewer />
            </div>
        </Provider>
    );
};

export default App;
