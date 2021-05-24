import {
    SET_USERNAME,
    UPDATE_ROOM_STATE,
    CHANGE_CALIBRATION_STATUS,
} from '../Actions/roomActions';
import Anime from 'animejs';
import Socket from '../socketHelper';

const defaultState = {
    name: '',
    timestamp: '',
    isPaused: false,
    url: '',
    mainUser: {
        username: '',
        calibrated: false,
        buffering: false,
    },
    otherUsers: [],
};

const handleChangeCalibrationStatus = (state, action) => {
    if (action.calibrated) {
        Anime({
            targets: '#calibration-status',
            width: '6vw',
            backgroundColor: '#33cc33',
            left: '3vw',
            duration: 2000,
        });
    } else {
        Anime({
            targets: '#calibration-status',
            width: '8vw',
            backgroundColor: '#ff0000',
            duration: 2000,
            left: '2vw',
        });
    }
    const newUser = {
        ...state.mainUser,
        calibrated: action.calibrated,
    };
    let socket = Socket();
    socket.updateUser(newUser);
    return { ...state, mainUser: newUser };
};

const handleNameChange = (state, action) => {
    const newUsername = {
        ...state.mainUser,
        username: action.username,
    };
    return {
        ...state,
        mainUser: newUsername,
    };
};

const handleRoomStateChange = (state, action) => {
    let users = action.roomState.users;
    users = users.filter((user) => user.username !== state.mainUser.username);
    console.log(users);
    return { ...state, otherUsers: users };
};

export default function (state = defaultState, action) {
    switch (action.type) {
        case SET_USERNAME:
            return handleNameChange(state, action);
        case UPDATE_ROOM_STATE:
            return handleRoomStateChange(state, action);
        case CHANGE_CALIBRATION_STATUS:
            return handleChangeCalibrationStatus(state, action);
        default:
            return state;
    }
}
