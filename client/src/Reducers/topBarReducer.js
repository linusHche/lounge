import { INPUT_URL } from '../Actions/topBarActions';

const defaultSearchState = {
    url: '',
    calibrationStatus: 'Not Calibrated',
};

export default function (state = defaultSearchState, action) {
    switch (action.type) {
        case INPUT_URL:
            return { ...state, url: action.url };
        default:
            return state;
    }
}
