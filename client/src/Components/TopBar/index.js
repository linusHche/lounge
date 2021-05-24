import React from 'react';
import './index.css';
import { connect } from 'react-redux';
import { inputUrl, updateUrl } from '../../Actions/topBarActions';
const TopBar = (props) => {
    return (
        <div>
            <div id="calibration-status">
                {props.calibrated ? 'Calibrated' : 'Not Calibrated'}
            </div>
            <div
                onClick={() =>
                    window.electronapi.sendToBrowserView('calibrate')
                }
                id="calibrate-btn"
                className="br-pill grow"
            >
                Calibrate
            </div>
            <div id="input-container">
                <input
                    onChange={(e) => props.inputUrl(e.target.value)}
                    id="url-input"
                    className="br-pill"
                    placeholder="Enter Website"
                    value={props.url}
                    onKeyPress={(e) =>
                        e.key === 'Enter' ? props.updateUrl() : null
                    }
                />
                <span
                    onClick={props.updateUrl}
                    id="go-search"
                    className="br-pill grow"
                >
                    Go
                </span>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    ...state.topBar,
    calibrated: state.room.mainUser.calibrated,
});

const mapDispatchToProps = (dispatch) => ({
    inputUrl: (url) => dispatch(inputUrl(url)),
    updateUrl: () => dispatch(updateUrl()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
