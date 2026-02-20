import React, { useState, useEffect } from 'react';
import SolarStructureModel from './SolarStructureModel';
import { RainBackground } from './ui/rain';

const SolarComparison = ({ windSpeed = 0 }) => {
    // Calculate vibration based on wind speed (mock logic)
    // Left side (Standard) vibrates more
    // Right side (Windproof) vibrates less

    // Physics Thresholds & Logic

    // 1. Vibration
    let standardVibration = 0;
    let windproofVibration = 0;

    // Local Structure: Starts shaking at 60 km/h
    if (windSpeed >= 60) {
        // Map 60-180 km/h to vibration 1-60
        const factor = Math.min(1, Math.max(0, (windSpeed - 60) / 120));
        standardVibration = 1 + (factor * 59);
    }

    // Kondaas Structure: Starts very minimal shaking at 80 km/h
    if (windSpeed >= 80) {
        // Map 80-180 km/h to vibration 0.5-2 (very subtle)
        const factor = Math.min(1, Math.max(0, (windSpeed - 80) / 100));
        windproofVibration = 0.5 + (factor * 1.5);
    }

    // 2. Rain & Atmosphere
    // No rain below 40 km/h
    const isRaining = windSpeed >= 40;

    const rainAngle = isRaining ? 10 + ((windSpeed - 40) / 140) * 40 : 0;
    const rainIntensity = isRaining ? 1 + ((windSpeed - 40) / 140) * 1.5 : 0;
    const cloudSpeed = isRaining ? 1 + ((windSpeed - 40) / 140) * 4 : 0.2; // Slow clouds when calm
    const storminess = isRaining ? (windSpeed - 40) / 140 : 0;

    // Destruction Logic
    const [isBlownAway, setIsBlownAway] = useState(false);

    useEffect(() => {
        if (windSpeed > 120) {
            setIsBlownAway(true);
        } else if (windSpeed < 50) {
            setIsBlownAway(false);
        }
    }, [windSpeed]);

    return (
        <div className="flex w-full h-full relative overflow-hidden bg-slate-950">
            {/* Dark Stormy Background with Red Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.15)_0%,transparent_100%)]"></div>

            <RainBackground
                className="absolute inset-0 z-0 pointer-events-none"
                angle={rainAngle}
                intensity={rainIntensity}
                cloudSpeed={cloudSpeed}
                storminess={storminess}
            />


            {/* LEFT: Kondaas Structure */}
            <div className="w-1/2 h-full relative border-r border-white/5 bg-gradient-to-r from-transparent to-black/20 overflow-hidden">
                <div className="absolute top-10 left-0 w-full text-center z-10">
                    <h2 className="text-white font-bold text-2xl tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        KONDAAS
                        <span className="block text-sm font-normal text-white/60 mt-1">SOLAR STRUCTURE</span>
                    </h2>
                </div>
                <div className="w-full h-full">
                    <SolarStructureModel
                        vibration={windproofVibration * 10}
                        isKondaas={true}
                        windSpeed={windSpeed}
                        cellColor="#003366" // Kondaas Deep Blue
                    />
                </div>
            </div>

            {/* RIGHT: Local Structure */}
            <div className="w-1/2 h-full relative overflow-hidden">
                <div className="absolute top-10 left-0 w-full text-center z-10">
                    <h2 className="text-white font-bold text-2xl tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        LOCAL
                        <span className="block text-sm font-normal text-white/60 mt-1">SOLAR STRUCTURE</span>
                    </h2>
                </div>
                <div
                    className={`w-full h-full transition-all duration-1000 ease-in-out ${isBlownAway ? 'opacity-0 translate-x-[200%] -translate-y-[100%] rotate-45' : 'opacity-100 translate-x-0 translate-y-0 rotate-0'}`}
                >
                    <SolarStructureModel
                        vibration={standardVibration * 10}
                        windSpeed={windSpeed}
                        cellColor="#003366" // Harmonized Deep Blue
                    />
                </div>

                {isBlownAway && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-red-500/50 text-4xl font-bold uppercase tracking-widest animate-pulse border-4 border-red-500/50 p-4 rounded-lg transform -rotate-12">
                            Structural Failure
                        </div>
                    </div>
                )}
            </div>

            {/* Center glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/10 shadow-[0_0_50px_20px_rgba(255,255,255,0.05)]"></div>

        </div>
    );
};

export default SolarComparison;
