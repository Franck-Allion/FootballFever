import React from 'react';

interface ActionTileProps {
    icon: string;
    title: string;
    subtitle: string;
    disabled?: boolean;
    onClick?: () => void;
    ariaLabel?: string;
}

const ActionTile: React.FC<ActionTileProps> = ({ icon, title, subtitle, disabled, onClick, ariaLabel }) => (
    <button
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel || title}
        className={`min-h-28 rounded-xl border p-5 text-left backdrop-blur-2xl transition-all active:scale-[0.99] ${
            disabled
                ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/25 grayscale'
                : 'border-white/10 bg-white/[0.03] text-white hover:border-[#39ff14]/50 hover:bg-[#39ff14]/5'
        }`}
    >
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-2xl font-black uppercase tracking-tight">{title}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{subtitle}</p>
            </div>
            <span className={`material-symbols-outlined rounded bg-black/50 p-3 text-3xl ${disabled ? 'text-white/20' : 'text-[#39ff14]'}`}>{icon}</span>
        </div>
    </button>
);

export default ActionTile;
