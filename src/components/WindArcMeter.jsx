import React, { useState, useRef, useEffect } from 'react';

const WindArcMeter = ({ speed, onSpeedChange }) => {
    // Config
    const minSpeed = 40;
    const maxSpeed = 180;

    // Design: 
    // 1. Separate footer background with curved top using SVG path
    // 2. Arc slider follows this curve
    // 3. Reduced height (container is 160px from App.jsx)

    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // SVG Dimension
    const svgWidth = 1920;
    const svgHeight = 160;

    // Design Parameters
    // Curve height in center: how much higher is the center than the sides?
    // Let's say sides are 80px high, center is 140px high.
    // We need a path: M 0 160 L 0 [sideHeight] Q 960 [centerHeight * 2 - sideHeight?] 1920 [sideHeight] L 1920 160 Z
    // Or just a large circle segment again but visible as a filled shape.

    // Let's use a Quadratic Bezier for the top curve.
    const sideY = 80; // Y coordinate from top of SVG (0 is top)
    const centerY = 20; // Y coordinate of the peak
    // Q Control point needs to be higher to pull the curve up to centerY.
    // For a Q curve starting at (0, 80) and ending at (1920, 80) to peak at 20:
    // Ty = (1-t)^2 * P0y + 2(1-t)t * P1y + t^2 * P2y
    // At t=0.5: 0.25*80 + 0.5*P1y + 0.25*80 = 20
    // 20 + 0.5*P1y + 20 = 20
    // 40 + 0.5*P1y = 20
    // 0.5*P1y = -20
    // P1y = -40

    const curvePath = `M 0 160 L 0 ${sideY} Q 960 -40 1920 ${sideY} L 1920 160 Z`;

    // Track Path (slightly inset from the top edge)
    // We can't easily offset a Q curve perfectly parallel without math, but for this shallow curve, moving Y down works.
    const trackOffsetY = 30;
    const trackSideY = sideY + trackOffsetY;
    const trackControlY = -40 + trackOffsetY;

    const trackPath = `M 100 ${trackSideY} Q 960 ${trackControlY} 1820 ${trackSideY}`;

    // Mapping speed to position on the curve
    // We will map speed linearly to X position (100 to 1820)
    // Then calculate Y based on the Q curve formula
    const minX = 100;
    const maxX = 1820;

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
        // Inverse solve for t in quadratic bezier x component?
        // x(t) = (1-t)^2 * x0 + 2(1-t)t * x1 + t^2 * x2
        // Here x0=100, x1=960, x2=1820.
        // It's linear logic for t if x1 is exactly mid (it is).
        // So t = (x - x0) / (x2 - x0)
        const t = (x - minX) / (maxX - minX);

        // y(t) = (1-t)^2 * y0 + 2(1-t)t * y1 + t^2 * y2
        // y0 = trackSideY, y1 = trackControlY, y2 = trackSideY
        return (1 - t) * (1 - t) * trackSideY + 2 * (1 - t) * t * trackControlY + t * t * trackSideY;
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

        // Normal vector approximation (Up/Down)
        // Since curve is flat, just vertical ticks are fine
        const tickLen = isMajor ? 15 : 8;

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
                        <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.95" /> {/* Dark Red */}
                        <stop offset="100%" stopColor="#450a0a" stopOpacity="0.98" /> {/* Darkest Maroon */}
                    </linearGradient>
                    <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
                    strokeWidth="1"
                    className="backdrop-blur-md"
                />

                {/* Track Line */}
                <path
                    d={trackPath}
                    fill="none"
                    stroke="rgba(255,100,100,0.15)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#glow)"
                />

                {/* Active Track Segment (Masked or partial? Logic is complex for Q curves) */}
                {/* Simpler: just draw line from start to current? No, it needs to follow curve. */}
                {/* We can reproduce the Q curve command but change the end point? No, Bezier doesn't work that way linearly. */}
                {/* For visual simplicity, let's just use the track gradient on the full track for now, 
                or overlay a second path if needed. 
                Let's stick to a glowing full track for "available range" and a thumb that moves. */}

                <path
                    d={trackPath}
                    fill="none"
                    stroke="url(#trackGradient)"
                    strokeWidth="2"
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
                            stroke={tick.isMajor ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}
                            strokeWidth={tick.isMajor ? 2 : 1}
                        />
                        {tick.isMajor && (
                            <text
                                x={tick.x}
                                y={tick.y2 + 20}
                                textAnchor="middle"
                                fill="white"
                                fontSize="14"
                                fontWeight="500"
                                className="font-sans opacity-80"
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
                    <circle r="20" fill="#dc2626" opacity="0.4" filter="url(#glow)" />
                    <circle r="14" fill="white" className="shadow-lg" />
                    <circle r="18" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.5" />
                </g>

            </svg>

            {/* Helper Text */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/30 text-[10px] tracking-widest pointer-events-none uppercase">
                Drag to Control Wind
            </div>
        </div>
    );
};

export default WindArcMeter;
