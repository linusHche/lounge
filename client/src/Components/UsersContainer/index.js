import React from 'react';
import './index.css';
import Anime from 'animejs';
import { connect } from 'react-redux';

const UsersContainer = (props) => {
    const animeSquares = () => {
        const properties = {
            keyframes: [
                { translateY: -2 },
                { translateY: 0 },
                { translateY: 2 },
                { translateY: 0 },
            ],
            loop: true,
            duration: 2000,
        };
        Anime({
            targets: ['.buffering-square-1'],
            ...properties,
        });
        Anime({
            targets: ['.buffering-square-2'],
            ...properties,
            keyframes: [
                { translateY: 2 },
                { translateY: 0 },
                { translateY: -2 },
                { translateY: 0 },
            ],
        });
        Anime({
            targets: ['.buffering-square-3'],
            ...properties,
        });
    };

    const getUserTileClassName = (user) => {
        animeSquares();
        let className = 'room-user animate__animated animate__slideInLeft';
        if (user.calibrated) {
            className += ' ' + 'ready';
        } else {
            className += ' ' + 'not-ready';
        }
        return className;
    };

    const renderUsers = () => {
        return [props.mainUser, ...props.otherUsers].map((user, i) => {
            return (
                <div className={getUserTileClassName(user)} key={i}>
                    <div style={{ position: 'relative' }}>
                        {user.username}
                        <div
                            style={{
                                position: 'absolute',
                                right: '1vw',
                                top: '1.5vh',
                                display: 'flex',
                                direction: 'row',
                            }}
                        >
                            <div
                                className={
                                    user.buffering ? 'buffering-square-1' : ''
                                }
                            ></div>
                            <div
                                className={
                                    user.buffering ? 'buffering-square-2' : ''
                                }
                                style={{ top: '0vh' }}
                            ></div>
                            <div
                                className={
                                    user.buffering ? 'buffering-square-3' : ''
                                }
                            ></div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return <div id="user-container">{renderUsers()}</div>;
};

const mapStateToProps = (state) => ({
    ...state.room,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UsersContainer);
