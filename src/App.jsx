import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SolarComparison from './components/SolarComparison';
import WindArcMeter from './components/WindArcMeter';
import SpeedDisplayBox from './components/SpeedDisplayBox';

import ControlPanel from './components/ControlPanel';

function App() {
    const [windSpeed, setWindSpeed] = useState(40);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFSChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, []);

    // Manual wind speed control
    const handleWindSpeedChange = (newSpeed) => {
        setWindSpeed(newSpeed);
    };

    const handleReset = () => {
        setWindSpeed(40);
    };

    const handleFullScreenToggle = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 to-blue-950 text-white font-sans selection:bg-blue-500/30">

            {/* Background Particles Placeholder - could be a separate component */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150">
                {/* Simple noise texture overlay for now */}
            </div>

            {/* Main Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col">

                {/* Header Section */}
                <header className="flex-none h-32 w-full z-50">
                    <Header />
                </header>

                {/* Side Control Panel */}
                <div className="absolute top-32 right-8 z-50">
                    <ControlPanel onReset={handleReset} onFullScreen={handleFullScreenToggle} isFullscreen={isFullscreen} />
                </div>

                {/* Main Comparison Section - Grows to fill available space */}
                <main className="flex-grow flex w-full relative z-0">
                    <SolarComparison windSpeed={windSpeed} />
                </main>

                {/* Bottom Wind Meter Section */}
                <footer className="flex-none h-[160px] w-full absolute bottom-0 left-0 z-40">
                    <WindArcMeter speed={windSpeed} onSpeedChange={handleWindSpeedChange} />
                    <SpeedDisplayBox speed={Math.round(windSpeed)} />
                </footer>

            </div>
        </div>
    );
}

export default App;
