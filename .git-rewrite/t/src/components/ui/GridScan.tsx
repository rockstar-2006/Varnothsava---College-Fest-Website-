'use client'

import React from 'react'

interface GridScanProps {
    sensitivity?: number
    lineThickness?: number
    linesColor?: string
    gridScale?: number
    scanColor?: string
    scanOpacity?: number
    enablePost?: boolean
    bloomIntensity?: number
    chromaticAberration?: number
    noiseIntensity?: number
    scanOnClick?: boolean
    enableGyro?: boolean
}

const GridScan: React.FC<GridScanProps> = ({ linesColor = '#064e3b', scanColor = '#10b981' }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(${linesColor} 1px, transparent 1px), linear-gradient(90deg, ${linesColor} 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />
            <div
                className="absolute inset-0 opacity-10 animate-pulse"
                style={{
                    background: `linear-gradient(to bottom, transparent, ${scanColor}, transparent)`,
                    backgroundSize: '100% 200px',
                    top: '-100%'
                }}
            />
        </div>
    )
}

export default GridScan
