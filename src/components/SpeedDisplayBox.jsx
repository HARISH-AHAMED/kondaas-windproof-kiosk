import React from 'react';

const SpeedDisplayBox = ({ speed }) => {
    return (
        <div className="absolute top-12 right-12 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-xl border-2 border-red-600 rounded-xl px-10 py-6 text-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black text-white leading-none drop-shadow-lg">
                        {speed}
                    </span>
                    <span className="text-xl font-bold text-red-500 uppercase tracking-tighter">
                        km/h
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SpeedDisplayBox;
