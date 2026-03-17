import React from 'react';
import { RotateCcw, Maximize, Minimize } from 'lucide-react';

const ControlPanel = ({ onReset, onFullScreen, isFullscreen }) => {
    // Buttons simplified: keep only Fullscreen and Reset (Red Theme)
    const buttons = [
        {
            id: 2,
            icon: isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />,
            label: isFullscreen ? "Exit Fullscreen" : "Fullscreen",
            action: onFullScreen
        },
        { id: 4, icon: <RotateCcw size={24} />, label: "Reset", action: onReset }
    ];

    return (
        <div className="flex flex-row items-center gap-3 md:gap-4 pointer-events-auto">
            {buttons.map((btn) => (
                <button
                    key={btn.id}
                    onClick={btn.action}
                    className="w-12 h-12 md:w-14 md:h-14 rounded border-2 border-white/20 flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all duration-300 group relative active:scale-95 touch-manipulation shadow-sm"
                >
                    <div className="scale-110">
                        {btn.icon}
                    </div>

                    {/* Tooltip for better UX */}
                    <span className="absolute right-full mr-4 px-4 py-2 bg-black/80 text-lg md:text-2xl rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {btn.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ControlPanel;
