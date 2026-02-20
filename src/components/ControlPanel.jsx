import React from 'react';
import { RotateCcw, Info, Triangle, Plus } from 'lucide-react';

const ControlPanel = ({ onReset, onFullScreen, isFullscreen }) => {
    // Buttons simplified: keep only Fullscreen and Reset (Red Theme)
    const buttons = [
        {
            id: 2,
            icon: isFullscreen ? <Plus style={{ transform: 'rotate(45deg)' }} size={24} /> : <Triangle size={24} />,
            label: isFullscreen ? "Exit" : "View",
            action: onFullScreen
        },
        { id: 4, icon: <RotateCcw size={24} />, label: "Reset", action: onReset }
    ];

    return (
        <div className="flex flex-col gap-5">
            {buttons.map((btn) => (
                <button
                    key={btn.id}
                    onClick={btn.action}
                    className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white bg-red-600 hover:bg-red-500 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)] group relative active:scale-95"
                >
                    <div className={btn.id === 2 && !isFullscreen ? "rotate-180" : ""}>
                        {btn.icon}
                    </div>

                    {/* Tooltip for better UX */}
                    <span className="absolute right-full mr-4 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {btn.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ControlPanel;
