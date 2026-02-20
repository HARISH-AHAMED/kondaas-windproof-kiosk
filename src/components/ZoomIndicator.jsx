import React from 'react';
import { motion } from 'framer-motion';

const ZoomIndicator = ({ label, subLabel, x = 0, y = 0, isActive = true }) => {
    return (
        <div
            className="absolute z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
        >
            {/* The Circle Magnifier */}
            <div className="w-48 h-48 rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] bg-white/5 backdrop-blur-sm relative overload-hidden group">
                {/* Crosshairs or internal UI */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-3/4 h-3/4 border border-white rounded-full"></div>
                </div>
            </div>

            {/* Connecting Line and Label */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-4 flex items-center"
            >
                {/* Horizontal Line connector */}
                <div className="w-16 h-[2px] bg-white/60 mr-0"></div>

                {/* Label Box */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 min-w-[200px] text-white">
                    <div className="text-lg font-medium">{label}</div>
                    {subLabel && (
                        <div className="text-sm text-white/70 mt-1">{subLabel}</div>
                    )}
                </div>
            </motion.div>

        </div>
    );
};

export default ZoomIndicator;
