import Socket from '../socketHelper';

export const INPUT_URL = 'INPUT_URL';
export const CHANGE_CALIBRATION_STATUS = 'CHANGE_CALIBRATION_STATUS';
export function inputUrl(url) {
    return {
        type: INPUT_URL,
        url,
    };
}

export function updateUrl() {
    return (dispatch, getState) => {
        const { url } = getState().topBar;
        return window.electronapi
            .updateUrl('send-to-browserview', url)
            .then((result) => {
                Socket().changeUrl(url);
                if (result) {
                    dispatch(changeCalibrationStatus('Not Calibrated'));
                }
            });
    };
}

export function changeCalibrationStatus(calibrationStatus) {
    return {
        type: CHANGE_CALIBRATION_STATUS,
        calibrationStatus,
    };
}
