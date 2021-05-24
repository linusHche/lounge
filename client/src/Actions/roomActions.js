export const SET_USERNAME = 'SET_USERNAME';
export const UPDATE_ROOM_STATE = 'UPDATE_ROOM_STATE';
export const CHANGE_CALIBRATION_STATUS = 'CHANGE_CALIBRATION_STATUS';

export function setUsername(username) {
    return {
        type: SET_USERNAME,
        username,
    };
}

export function updateRoomState(roomState) {
    return {
        type: UPDATE_ROOM_STATE,
        roomState,
    };
}

export function changeCalibrationStatus(calibrated) {
    return {
        type: CHANGE_CALIBRATION_STATUS,
        calibrated,
    };
}
