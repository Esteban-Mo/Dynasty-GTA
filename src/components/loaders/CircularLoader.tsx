import React from 'react';
import './circularLoader.css';

const CircularLoader = () => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <div className="loading">

                <div className="loader">
                    <div className="face">
                        <div className="circle"></div>
                    </div>
                    <div className="face">
                        <div className="circle"></div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CircularLoader;