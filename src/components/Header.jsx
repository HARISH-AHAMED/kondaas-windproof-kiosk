import React from 'react';

const Header = ({ children }) => {
    return (
        <div className="w-full h-full z-50">
            {/* Red Branding Header Bar */}
            <div className="w-full h-full bg-[#cc1a1a] shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 md:px-12 relative overflow-hidden">
                {/* Left Side: Logo & Branding */}
                <div className="flex items-center gap-6 h-full relative z-10 w-full py-4 md:py-6">
                    {/* Logo Box (Placeholder matching shape) */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded flex flex-col justify-center items-center overflow-hidden shrink-0 shadow-sm">
                        {/* Abstract red shapes mimicking the logo */}
                        <div className="w-[80%] h-[35%] bg-[#cc1a1a]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
                        <div className="w-[80%] h-[35%] bg-[#cc1a1a] mt-[3px]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
                    </div>

                    {/* Text Container: Stacks Title and Subtitle vertically next to Logo */}
                    <div className="flex flex-col justify-center h-full text-white">
                        {/* Title Split Row */}
                        <div className="flex items-center gap-3 md:gap-4 leading-none whitespace-nowrap mb-2">
                            <h1 className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight pb-[2px]">Kondaas</h1>
                            <div className="w-[3px] h-8 md:h-12 bg-white rounded-full"></div>
                            <span className="text-3xl md:text-5xl font-light tracking-wide pt-[2px]">SOLAR SYSTEMS</span>
                        </div>
                        
                        {/* Subtitle */}
                        <p className="text-base md:text-xl font-bold tracking-wide leading-none text-white/90">
                            Best Solar Installer Across South India
                        </p>
                    </div>
                </div>

                {/* Right Side: Action Buttons (Injected via children) */}
                {children && (
                    <div className="flex items-center justify-end gap-3 md:gap-5 relative z-10 pr-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
