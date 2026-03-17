import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SolarComparison from './components/SolarComparison';
import WindArcMeter from './components/WindArcMeter';
import SpeedDisplayBox from './components/SpeedDisplayBox';
import ControlPanel from './components/ControlPanel';
import WeatherModal from './components/WeatherModal';

function App() {
    const [windSpeed, setWindSpeed] = useState(0);
    const [locationName, setLocationName] = useState('');
    const [resetKey, setResetKey] = useState(0);
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

    const handleWeatherSuccess = (newSpeed, location) => {
        setWindSpeed(newSpeed);
        if (location) {
            setLocationName(location);
        }
    };

    const handleReset = () => {
        setWindSpeed(0);
        setLocationName('');
        setResetKey(prev => prev + 1);
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
        <div key={resetKey} className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-900 to-blue-950 text-white font-sans selection:bg-blue-500/30">
            {/* Background Particles Placeholder - could be a separate component */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150">
                {/* Simple noise texture overlay for now */}
            </div>

            {/* Main Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col">

                {/* Header Section */}
                <header className="flex-none h-24 md:h-32 w-full z-50">
                    <Header>
                        <WeatherModal onSuccess={handleWeatherSuccess} />
                        <ControlPanel onReset={handleReset} onFullScreen={handleFullScreenToggle} isFullscreen={isFullscreen} />
                    </Header>
                </header>

                {/* Main Comparison Section - Grows to fill available space */}
                <main className="flex-grow w-full relative z-0 overflow-hidden">
                    <SolarComparison windSpeed={windSpeed} />
                </main>

                {/* Bottom Wind Meter Section - Overlay at the bottom */}
                <footer className="absolute bottom-0 h-[140px] md:h-[180px] w-full z-40 pointer-events-none">
                    <div className="w-full h-full relative pointer-events-auto">
                        <WindArcMeter speed={windSpeed} onSpeedChange={handleWindSpeedChange} />
                        <SpeedDisplayBox speed={Math.round(windSpeed)} location={locationName} />
                    </div>
                </footer>

            </div>
        </div>
    );
}

export default App;
