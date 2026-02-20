import React from 'react';

const Header = () => {
    return (
        <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
            {/* Red Branding Header Bar */}
            <div className="w-full h-24 bg-gradient-to-r from-red-700 via-red-600 to-red-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center px-12 relative overflow-hidden">
                {/* Ambient glow in red bar */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)] opacity-50"></div>

                {/* Logo Area */}
                <div className="pointer-events-auto relative z-10">
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                        KONDAAS
                    </h1>
                </div>

                {/* Center Title Area */}
                <div className="absolute left-1/2 transform -translate-x-1/2 text-center pointer-events-auto relative z-10">
                    <h2 className="text-3xl font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        LOCAL SOLAR STRUCTURE
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default Header;
