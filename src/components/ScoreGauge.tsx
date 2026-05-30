import { motion } from 'motion/react';

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const getSeverityInfo = (val: number) => {
    if (val > 80) return { label: 'CRITICAL', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-600' };
    if (val > 60) return { label: 'HIGH RISK', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-600' };
    if (val > 30) return { label: 'MEDIUM RISK', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-600' };
    return { label: 'LOW RISK', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-600' };
  };

  const info = getSeverityInfo(score);

  return (
    <div className="flex flex-col items-center justify-center" id="gauge-container">
      <div className="w-36 h-36 border-4 border-[#141414] bg-white flex flex-col items-center justify-center text-center p-3 shadow-[4px_4px_0px_#141414]">
        <div className="text-[10px] font-bold uppercase tracking-tighter text-[#141414]/60">Risk Score</div>
        
        <motion.div 
          className="text-6xl font-black font-mono tracking-tighter text-[#141414] my-1"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          {score}
        </motion.div>
        
        <div className="text-[9px] uppercase font-mono opacity-60">/ 100 SCALE</div>
      </div>

      <motion.div 
        className={`mt-4 px-3 py-1 border border-[#141414] text-xs font-mono font-bold uppercase tracking-widest ${info.bg} ${info.color} shadow-[2px_2px_0px_#141414]`}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        id="gauge-badge"
      >
        {info.label}
      </motion.div>
    </div>
  );
}

