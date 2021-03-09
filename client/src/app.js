import React, { useEffect, useState } from 'react';
import Viewer from './Components/Viewer';
import TopBar from './Components/TopBar';
import { Provider } from 'react-redux';
import 'tachyons';
import './index.css';
import configureStore from './store';
import Socket from './socketHelper';
import UserContainer from './Components/UserContainer';
import { changeCalibrationStatus } from './Actions/topBarActions';
const store = configureStore();

const App = () => {
    let name = 'user' + Math.floor(Math.random() * 100 + 1);
    let room = 'test';
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        window.electronapi.addFunctionToMapping('handle-recalibration', () =>
            store.dispatch(changeCalibrationStatus('Calibrated'))
        );
        setSocket(Socket(room, store).joinRoom(name, room));
    }, []);

    return (
        <Provider store={store}>
            <div>
                <UserContainer />
                <TopBar />
                <Viewer />
            </div>
        </Provider>
    );
};

export default App;
