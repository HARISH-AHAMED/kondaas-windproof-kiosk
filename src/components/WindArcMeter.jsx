import React, { useState, useRef, useEffect } from 'react';

const WindArcMeter = ({ speed, onSpeedChange }) => {
    // Config
    const minSpeed = 0;
    const maxSpeed = 180;

    // Design: 
    // 1. Separate footer background with curved top using SVG path
    // 2. Arc slider follows this curve
    // 3. Reduced height (container is 160px from App.jsx)

    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // SVG Dimension
    const svgWidth = 1920;
    const svgHeight = 180; // Natively matched to new footer height

    // Design Parameters
    const sideY = 100;
    
    // curve path: M P0x P0y C P1x P1y, P2x P2y, P3x P3y
    // Peak at 10 (t=0.5)
    const curvePath = `M 0 180 L 0 ${sideY} C 640 -20, 1280 -20, 1920 ${sideY} L 1920 180 Z`;

    // Track Path (slightly inset from the top edge)
    const trackOffsetY = 30;
    const trackSideY = sideY + trackOffsetY;
    const trackPeakY = 10 + trackOffsetY;
    // Cubic control points for track (P1y and P2y adjusted to hit peak)
    // 0.125*130 + 0.75*P1y + 0.125*130 = 40 => 16.25 + 0.75*P1y + 16.25 = 40 => 32.5 + 0.75*P1y = 40 => 0.75P1y = 7.5 => P1y=10
    const trackControlY = 10; 

    // minX and maxX for track
    const minX = 100;
    const maxX = 1820;

    const trackPath = `M ${minX} ${trackSideY} C 640 ${trackControlY} 1280 ${trackControlY} ${maxX} ${trackSideY}`;

    const mapSpeedToX = (s) => {
        const percent = (s - minSpeed) / (maxSpeed - minSpeed);
        return minX + percent * (maxX - minX);
    };

    const mapXToSpeed = (x) => {
        const clampedX = Math.max(minX, Math.min(maxX, x));
        const percent = (clampedX - minX) / (maxX - minX);
        return Math.round(minSpeed + percent * (maxSpeed - minSpeed));
    };

    const getYForX = (x) => {
        const t = (x - minX) / (maxX - minX);
        const invT = (1 - t);
        // Cubic Bezier: (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
        return invT * invT * invT * trackSideY + 
               3 * invT * invT * t * trackControlY + 
               3 * invT * t * t * trackControlY + 
               t * t * t * trackSideY;
    };

    const currentX = mapSpeedToX(speed);
    const currentY = getYForX(currentX);

    const handlePointerDown = (e) => {
        setIsDragging(true);
        updateSpeedFromEvent(e);
    };

    const handlePointerMove = (e) => {
        if (isDragging) {
            updateSpeedFromEvent(e);
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const updateSpeedFromEvent = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;

        // Scale pixel coordinate to SVG coordinate (1920 width)
        const svgX = (x / rect.width) * svgWidth;

        const newSpeed = mapXToSpeed(svgX);
        if (onSpeedChange && newSpeed !== speed) {
            onSpeedChange(newSpeed);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    // Ticks
    const ticks = [];
    for (let i = minSpeed; i <= maxSpeed; i += 10) {
        const isMajor = i % 20 === 0;
        const tx = mapSpeedToX(i);
        const ty = getYForX(tx);

        // Make ticks longer for kiosk visibility
        const tickLen = isMajor ? 20 : 10;

        ticks.push({
            value: i,
            x: tx,
            y: ty,
            y2: ty + tickLen,
            isMajor
        });
    }

    return (
        <div
            ref={containerRef}
            className="absolute bottom-0 left-0 w-full h-full flex justify-center items-end select-none pointer-events-auto cursor-col-resize active:cursor-grabbing"
            onPointerDown={handlePointerDown}
        >
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible drop-shadow-2xl">
                <defs>
                    <linearGradient id="footerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.95" /> {/* Vibrant Red */}
                        <stop offset="100%" stopColor="#991b1b" stopOpacity="0.98" /> {/* Deep Red */}
                    </linearGradient>
                    <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Footer Background Shape */}
                <path
                    d={curvePath}
                    fill="url(#footerGradient)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                    className="backdrop-blur-md"
                />

                {/* Track Line */}
                <path
                    d={trackPath}
                    fill="none"
                    stroke="rgba(255,100,100,0.15)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    filter="url(#glow)"
                />

                <path
                    d={trackPath}
                    fill="none"
                    stroke="url(#trackGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    opacity="0.6"
                />

                {/* Ticks */}
                {ticks.map(tick => (
                    <g key={tick.value}>
                        <line
                            x1={tick.x} y1={tick.y}
                            x2={tick.x} y2={tick.y2}
                            stroke={tick.isMajor ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
                            strokeWidth={tick.isMajor ? 4 : 2}
                        />
                        {tick.isMajor && (
                            <text
                                x={tick.x}
                                y={tick.y2 + 30}
                                textAnchor="middle"
                                fill="white"
                                fontSize="24"
                                fontWeight="700"
                                className="font-sans opacity-90"
                            >
                                {tick.value}
                            </text>
                        )}
                    </g>
                ))}

                {/* Draggable Thumb */}
                <g
                    transform={`translate(${currentX}, ${currentY})`}
                    className="transition-transform duration-75 ease-out"
                    style={{ pointerEvents: 'none' }}
                >
                    <circle r="40" fill="#dc2626" opacity="0.4" filter="url(#glow)" />
                    <circle r="26" fill="white" className="shadow-2xl" />
                    <circle r="34" fill="none" stroke="#dc2626" strokeWidth="4" opacity="0.7" />
                </g>

            </svg>

            {/* Helper Text */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/40 text-sm md:text-xl tracking-[0.3em] pointer-events-none uppercase font-bold">
                Drag to Control Wind
            </div>
        </div>
    );
};

export default WindArcMeter;
