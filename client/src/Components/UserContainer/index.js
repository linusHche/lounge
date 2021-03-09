import { removeData } from 'jquery';
import React from 'react';
import './index.css';
import Anime from 'animejs';

const UserContainer = () => {
    const users = [
        { name: 'User 1', status: 'Calibrated', buffering: false },
        { name: 'User 2', status: 'Not Calibrated', buffering: true },
    ];

    const animeSquares = () => {
        Anime({
            targets: [
                '.buffering-square-1',
                '.buffering-square-2',
                '.buffering-square-3',
            ],
            translateY: -10,
            loop: true,
            easing: 'easeInOutSine',
            // direction: 'alternate',
            delay: Anime.stagger(100),
        });
        // Anime({
        //     targets: ['.buffering-square-2'],
        //     translateY: -10,
        //     loop: true,
        //     delay: 100,
        //     easing: 'easeInOutSine',
        //     direction: 'alternate',
        // });
        // Anime({
        //     targets: ['.buffering-square-3'],
        //     translateY: -10,
        //     loop: true,
        //     delay: 100,
        //     easing: 'easeInOutSine',
        //     direction: 'alternate',
        // });
    };

    const renderUsers = () => {
        return users.map((user, i) => {
            return (
                <div
                    className={
                        user.status === 'Calibrated'
                            ? 'room-user ready'
                            : 'room-user not-ready'
                    }
                    key={i}
                >
                    <div style={{ position: 'relative' }}>
                        {user.name}
                        <div
                            style={{
                                position: 'absolute',
                                right: '1vw',
                                top: '1.5vh',
                                display: 'flex',
                                direction: 'row',
                            }}
                        >
                            <div className="buffering-square-1"></div>
                            <div className="buffering-square-2"></div>
                            <div className="buffering-square-3"></div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div id="user-container" onClick={animeSquares}>
            {renderUsers()}
        </div>
    );
};

export default UserContainer;
