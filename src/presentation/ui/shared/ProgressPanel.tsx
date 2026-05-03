import React from 'react';

interface ProgressPanelProps {
    label: string;
    value: number;
    status: string;
    tone: 'positive' | 'warning';
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ label, value, status, tone }) => {
    const activeColor = tone === 'positive' ? 'bg-[#39ff14] shadow-[0_0_10px_#39ff14]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]';
    const statusColor = tone === 'positive' ? 'text-[#39ff14]' : 'text-amber-300';

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-inner backdrop-blur-2xl">
            <div className="mb-4 flex items-end justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{label}</p>
                <p className={`text-sm font-black uppercase ${statusColor}`}>{status}</p>
            </div>
            <div className="flex h-2 gap-1" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <div
                        key={index}
                        className={`flex-1 rounded-full transition-all ${index < Math.round(value / 5) ? activeColor : 'bg-white/5'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProgressPanel;
