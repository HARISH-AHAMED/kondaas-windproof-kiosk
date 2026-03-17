import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
// Import the raw frame logic from the existing model
import { SolarFrame } from './SolarStructureModel';

const ZoomCircle = ({ vibration = 0, isKondaas = false, windSpeed = 0, cellColor, vibrationText = "0 mm", subLabel = "" }) => {
    return (
        <div className="flex flex-col items-center">
            {/* The Circular Magnifier */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                {/* Crosshairs to look like a scope */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/20 z-10 pointer-events-none"></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-white/20 z-10 pointer-events-none"></div>

                <Canvas>
                    {/* Fixed Level Camera */}
                    <PerspectiveCamera makeDefault position={[0, 0.6, 2.2]} fov={35} />

                    <ambientLight intensity={0.6} />
                    <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={1.5} />

                    {/* Shift the entire frame left by 1.8 units so the RIGHT leg (which is at +1.8) sits directly at 0, natively in front of the camera */}
                    <group position={[-1.8, 0, 0]}>
                        <SolarFrame
                            vibrationIntensity={vibration}
                            isKondaas={isKondaas}
                            windSpeed={windSpeed}
                            cellColor={cellColor}
                        />
                    </group>

                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* The Label reading "Column Vibration: X mm" */}
            <div className="mt-4 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-lg flex flex-col items-center">
                <span className="text-white text-sm md:text-base font-medium tracking-wide">
                    Column vibration : <span className="font-bold text-red-400">{vibrationText}</span>
                </span>
                {subLabel && (
                    <span className="text-red-300 text-xs md:text-sm font-bold mt-1">
                        {subLabel}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ZoomCircle;
