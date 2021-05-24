import Socket from '../socketHelper';
import { changeCalibrationStatus } from './roomActions';

export const INPUT_URL = 'INPUT_URL';
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
                    dispatch(changeCalibrationStatus(false));
                }
            });
    };
}
