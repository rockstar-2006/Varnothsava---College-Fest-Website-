"use client";

import React from 'react';

interface FooterTickerProps {
    themeColor?: string;
}

const FooterTicker: React.FC<FooterTickerProps> = ({ themeColor = "#00e5ff" }) => {
    return (
        <div
            className="footer-ticker"
            style={{
                borderTop: `1px solid ${themeColor}40`,
                color: themeColor
            }}
        >
            <div className="ticker-track">
                <span className="ticker-item">SYSTEM STATUS: <span className="status-ok" style={{ textShadow: `0 0 5px ${themeColor}` }}>OPERATIONAL</span></span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">ENCRYPTION: <span className="status-warn">AES-256-GCM</span></span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">LAST LOGIN: <span className="status-ok">AUTHORIZED ADMIN</span></span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">NETWORK LATENCY: 24ms</span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">SECURE CONNECTION ESTABLISHED</span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">DEV_PROTOCOL_V2.0 LOADED</span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                {/* Duplicate for seamless loop */}
                <span className="ticker-item">SYSTEM STATUS: <span className="status-ok">OPERATIONAL</span></span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">ENCRYPTION: <span className="status-warn">AES-256-GCM</span></span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">LAST LOGIN: <span className="status-ok">AUTHORIZED ADMIN</span></span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">NETWORK LATENCY: 24ms</span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">SECURE CONNECTION ESTABLISHED</span>
                <span className="separator" style={{ color: `${themeColor}40` }}>///</span>
                <span className="ticker-item">DEV_PROTOCOL_V2.0 LOADED</span>
            </div>
        </div>
    );
};

export default FooterTicker;
