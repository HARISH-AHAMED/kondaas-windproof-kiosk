import React from 'react';

const SpeedDisplayBox = ({ speed, location }) => {
    return (
        <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-50">
            <div className="bg-black/80 backdrop-blur-xl border-2 md:border-4 border-red-600 rounded-2xl md:rounded-3xl px-6 py-4 md:px-10 md:py-8 text-center shadow-[0_0_30px_rgba(220,38,38,0.4)] flex flex-col items-center min-w-[180px] md:min-w-[240px]">
                {location && (
                    <div className="w-full border-b border-red-500/50 pb-2 mb-2 md:mb-4">
                        <span className="text-sm md:text-xl font-bold text-white/90 uppercase tracking-widest block truncate px-2">
                            {location}
                        </span>
                    </div>
                )}
                <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-6xl md:text-8xl font-black text-white leading-none drop-shadow-xl">
                        {speed}
                    </span>
                    <span className="text-2xl md:text-4xl font-bold text-red-500 uppercase tracking-tighter">
                        km/h
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SpeedDisplayBox;
