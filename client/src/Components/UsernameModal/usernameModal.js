import React, { useState } from 'react';
import './usernameModal.css';

const UsernameModal = (props) => {
    const [username, setUsername] = useState('');
    return (
        <div className="modal-container animate__animated animate__fadeInDown br4">
            <span id="username-modal-title">Enter Username</span>
            <input
                onChange={(e) => setUsername(e.target.value)}
                id="username-input"
                className="br-pill"
                onKeyPress={(e) =>
                    e.key === 'Enter' ? props.confirmUsername(username) : null
                }
            />
        </div>
    );
};

export default UsernameModal;
