import React, { useState, useEffect } from 'react';
import SolarStructureModel from './SolarStructureModel';
import ZoomCircle from './ZoomCircle';
import { RainBackground } from './ui/rain';
import { 
    ShieldCheck, 
    Shield, 
    Moon, 
    TrendingUp, 
    LineChart, 
    Snowflake, 
    ShieldAlert, 
    CloudRain, 
    TrendingDown, 
    ThermometerSun,
    Activity
} from 'lucide-react';

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

    // Label Map logic to show extreme marketing comparison integers
    const kondaasVibMM = windSpeed > 60 ? Math.max(1, Math.round(windproofVibration * 4)) : 0;
    const standardVibMM = windSpeed > 60 ? Math.round(standardVibration * 3) : 0;
    const stressMultiplier = (standardVibMM > 0 && kondaasVibMM > 0) ? Math.round(standardVibMM / kondaasVibMM) : 0;
    const subLabelText = stressMultiplier > 1 ? `(${stressMultiplier} times more)` : "";

    // 2. Rain & Atmosphere
    // No rain physically appearing below 40 km/h in simulation math, 
    // but visually we start smoothly fading to storm at 30 km/h, fully complete by 70 km/h.
    const stormOpacity = Math.min(1, Math.max(0, (windSpeed - 30) / 40));

    const isRaining = windSpeed >= 40;

    // Ensure initial values are non-zero so the canvas initializes the drops array, 
    // it will be hidden by opacity until stormOpacity > 0.
    const rainAngle = isRaining ? 10 + ((windSpeed - 40) / 140) * 40 : 10;
    const rainIntensity = isRaining ? 1 + ((windSpeed - 40) / 140) * 1.5 : 1;
    const cloudSpeed = isRaining ? 1 + ((windSpeed - 40) / 140) * 4 : 0.2; // Slow clouds when calm
    const storminess = isRaining ? (windSpeed - 40) / 140 : 0;

    // Destruction Logic
    const [isBlownAway, setIsBlownAway] = useState(false);

    const isBlownAwayThresh = 120; // Keep same logic

    useEffect(() => {
        if (windSpeed > isBlownAwayThresh) {
            setIsBlownAway(true);
        } else if (windSpeed < 50) {
            setIsBlownAway(false);
        }
    }, [windSpeed]);

    return (
        <div className="flex w-full h-full relative overflow-hidden bg-slate-950">
            {/* 2. Base Dark Background */}
            <div className="absolute inset-0 bg-slate-950 pointer-events-none"></div>

            {/* 3. Dark Stormy Background with Red Glow (Overlay) - Now Permanent */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.15)_0%,transparent_100%)] pointer-events-none z-[2]"
            ></div>

            {/* 4. Rain Canvas (Overlay) - Now permanently visible for ambient clouds */}
            <div className="absolute inset-0 pointer-events-none z-[3]">
                <RainBackground
                    className="w-full h-full pointer-events-none"
                    angle={rainAngle}
                    intensity={rainIntensity}
                    cloudSpeed={cloudSpeed}
                    storminess={storminess}
                />
            </div>

            {/* Content Layer container z-index to stay above background */}
            <div className="absolute inset-0 z-10 flex w-full h-full pb-[140px] md:pb-[180px]">

                {/* LEFT: Kondaas Structure */}
                <div className="w-1/2 h-full relative overflow-hidden">
                    <div className="absolute top-8 md:top-12 left-0 w-full text-center z-20">
                        <h2 className="text-white font-bold text-3xl md:text-5xl tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            KONDAAS
                            <span className="block text-xl md:text-2xl font-normal text-white/60 mt-1 md:mt-3">SOLAR STRUCTURE</span>
                        </h2>
                    </div>

                    {/* Kondaas Marketing Features Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-20">
                        {/* Top Left Feature */}
                        <div className="absolute top-[18%] left-[4%] flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#003366] border-2 border-[#4da6ff] flex items-center justify-center shadow-[0_0_15px_rgba(77,166,255,0.6)]">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight">25+ Year</span>
                                <span className="block text-sm md:text-base leading-tight">Performance Warranty</span>
                            </div>
                        </div>

                        {/* Mid Left Feature */}
                        <div className="absolute top-[32%] left-[4%] flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#003366] border-2 border-[#4da6ff] flex items-center justify-center shadow-[0_0_15px_rgba(77,166,255,0.6)]">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight">Anti-PID</span>
                                <span className="block text-sm md:text-base leading-tight">Technology</span>
                            </div>
                        </div>

                        {/* Top Right Feature */}
                        <div className="absolute top-[18%] right-[4%] flex items-center gap-3 flex-row-reverse text-right">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#003366] border-2 border-[#4da6ff] flex items-center justify-center shadow-[0_0_15px_rgba(77,166,255,0.6)]">
                                <Moon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight">Better Low Light</span>
                                <span className="block text-sm md:text-base leading-tight">Performance</span>
                            </div>
                        </div>

                        {/* Mid Right Feature */}
                        <div className="absolute top-[32%] right-[4%] flex items-center gap-3 flex-row-reverse text-right">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#003366] border-2 border-[#4da6ff] flex items-center justify-center shadow-[0_0_15px_rgba(77,166,255,0.6)]">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight">High</span>
                                <span className="block text-sm md:text-base leading-tight">Energy Yield</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full">
                        <SolarStructureModel
                            vibration={windproofVibration * 10}
                            isKondaas={true}
                            windSpeed={windSpeed}
                            cellColor="#003366" // Kondaas Deep Blue
                        />
                    </div>

                    {/* Scope / Zoom Overlay */}
                    <div className="absolute bottom-4 md:bottom-12 left-1/2 -translate-x-1/2 z-30">
                        <ZoomCircle
                            vibration={windproofVibration * 20} // Multiply vibration for visibility
                            isKondaas={true}
                            windSpeed={windSpeed}
                            cellColor="#003366"
                            vibrationText={`${kondaasVibMM} mm`}
                        />
                    </div>
                </div>

                {/* RIGHT: Local Structure */}
                <div className="w-1/2 h-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1)_0%,transparent_70%)]">
                    <div className="absolute top-8 md:top-12 left-0 w-full text-center z-20">
                        <h2 className="text-white font-bold text-3xl md:text-5xl tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            OTHER
                            <span className="block text-xl md:text-2xl font-normal text-white/60 mt-1 md:mt-3">SOLAR STRUCTURE</span>
                        </h2>
                    </div>

                    {/* Other Marketing Features Overlay */}
                    <div className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 ${isBlownAway ? 'opacity-0' : 'opacity-100'}`}>
                        {/* Top Left Feature */}
                        <div className="absolute top-[18%] left-[4%] flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#660000] border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                <ShieldAlert className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight text-red-100">Lower Warranty</span>
                            </div>
                        </div>

                        {/* Mid Left Feature */}
                        <div className="absolute top-[32%] left-[4%] flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#660000] border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                <CloudRain className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight text-red-100">Poor Low Light</span>
                                <span className="block text-sm md:text-base leading-tight text-red-100">Performance</span>
                            </div>
                        </div>

                        {/* Top Right Feature (Mirrored) */}
                        <div className="absolute top-[18%] right-[4%] flex items-center gap-3 flex-row-reverse text-right">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#660000] border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight text-red-100">Higher</span>
                                <span className="block text-sm md:text-base leading-tight text-red-100">Degradation</span>
                            </div>
                        </div>

                        {/* Mid Right Feature (Mirrored) */}
                        <div className="absolute top-[32%] right-[4%] flex items-center gap-3 flex-row-reverse text-right">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#660000] border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <span className="block font-bold md:text-lg leading-tight text-red-100">No Anti-PID</span>
                                <span className="block text-sm md:text-base leading-tight text-red-100">Protection</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`w-full h-full ${isBlownAway ? 'transition-all duration-1000 ease-in-out opacity-0 translate-x-[200%] -translate-y-[100%] rotate-45' : 'transition-opacity duration-1000 ease-in opacity-100 translate-x-0 translate-y-0 rotate-0'}`}
                    >
                        <SolarStructureModel
                            vibration={standardVibration * 10}
                            windSpeed={windSpeed}
                            cellColor="#003366" // Harmonized Deep Blue
                        />
                    </div>

                    {isBlownAway && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                            <div className="text-red-500/50 text-4xl font-bold uppercase tracking-widest animate-pulse border-4 border-red-500/50 p-4 rounded-lg transform -rotate-12">
                                Structural Failure
                            </div>
                        </div>
                    )}

                    {/* Scope / Zoom Overlay */}
                    <div className={`absolute bottom-4 md:bottom-12 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500 ${isBlownAway ? 'opacity-0' : 'opacity-100'}`}>
                        <ZoomCircle
                            vibration={standardVibration * 20}
                            isKondaas={false}
                            windSpeed={windSpeed}
                            cellColor="#003366"
                            vibrationText={`${standardVibMM} mm`}
                            subLabel={subLabelText}
                        />
                    </div>
                </div>

                {/* Center glow effect & Solid Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/30 shadow-[0_0_50px_20px_rgba(255,255,255,0.05)] z-20"></div>
            </div>
        </div>
    );
};

export default SolarComparison;
