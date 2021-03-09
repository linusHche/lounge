import { CHANGE_CALIBRATION_STATUS, INPUT_URL } from '../Actions/topBarActions';
import Anime from 'animejs';

const defaultSearchState = {
    url: '',
    calibrationStatus: 'Not Calibrated',
};

const handleChangeCalibrationStatus = (state, action) => {
    switch (action.calibrationStatus) {
        case 'Not Calibrated':
            Anime({
                targets: '#calibration-status',
                width: '8vw',
                backgroundColor: '#ff0000',
                duration: 2000,
                left: '2vw',
            });
            break;
        case 'Calibrated':
            Anime({
                targets: '#calibration-status',
                width: '6vw',
                backgroundColor: '#33cc33',
                left: '3vw',
                duration: 2000,
            });
    }
    return { ...state, calibrationStatus: action.calibrationStatus };
};

export default function (state = defaultSearchState, action) {
    switch (action.type) {
        case INPUT_URL:
            return { ...state, url: action.url };
        case CHANGE_CALIBRATION_STATUS:
            return handleChangeCalibrationStatus(state, action);
        default:
            return state;
    }
}
