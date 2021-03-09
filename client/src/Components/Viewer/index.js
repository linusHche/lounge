import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

export default function () {
    const viewer = useRef(null);
    const [isFullScreen, setFullScreen] = useState(false);

    const findBoundary = () => {
        const container = ReactDOM.findDOMNode(viewer.current);
        const bounds = container.getBoundingClientRect();
        const x = Math.round(bounds.left);
        const y = Math.round(bounds.top);
        const width = Math.round(bounds.width);
        const height = Math.round(bounds.height);
        return { x, y, width, height };
    };

    const changeScreen = (toMaximize) => {
        setFullScreen(toMaximize);
    };

    useEffect(() => {
        const { setBounds, addFunctionToMapping } = window.electronapi;
        setBounds('build-browserview', findBoundary());
        window.addEventListener('resize', () => {
            setBounds('build-browserview', findBoundary());
        });
        addFunctionToMapping('enter-full-screen', () => changeScreen(true));
        addFunctionToMapping('leave-full-screen', () => changeScreen(false));
    }, []);

    return (
        <div
            ref={viewer}
            className={isFullScreen ? 'full-screen' : 'not-full-screen'}
            id="embedded-viewer"
        ></div>
    );
}
