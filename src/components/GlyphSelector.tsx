import { motion } from 'motion/react';
import { GlyphPresetId, GlyphPreset, ThemeId } from '../types';
import { GLYPH_PRESETS } from '../utils/glyphs';
import { THEMES } from '../utils/themes';
import { playToggleSound } from '../utils/sound';

interface GlyphSelectorProps {
  currentGlyphId: GlyphPresetId;
  onGlyphChange: (id: GlyphPresetId) => void;
  themeId: ThemeId;
}

export default function GlyphSelector({ currentGlyphId, onGlyphChange, themeId }: GlyphSelectorProps) {
  const currentTheme = THEMES[themeId];

  const handleGlyphChange = (id: GlyphPresetId) => {
    playToggleSound();
    onGlyphChange(id);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold tracking-wider uppercase opacity-80 ${currentTheme.fontFamily}`}>
          Marker Character Set
        </span>
        <span className={`text-xs font-mono font-medium ${currentTheme.accentColor}`}>
          Active: {GLYPH_PRESETS[currentGlyphId].name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        {(Object.keys(GLYPH_PRESETS) as GlyphPresetId[]).map((presetKey) => {
          const preset = GLYPH_PRESETS[presetKey];
          const isActive = presetKey === currentGlyphId;

          // Align classes nicely to match the selected parent theme beautifully
          const rawSelectStyles =
            themeId === 'brutalist'
              ? `${
                  isActive
                    ? 'bg-[#ffff00] border-4 border-black text-black font-extrabold shadow-[2px_2px_0px_#000000] rounded-none'
                    : 'bg-white border-2 border-black text-black font-bold active:translate-x-[1px] active:translate-y-[1px] rounded-none'
                }`
              : themeId === 'synthwave'
              ? `rounded-xl ${
                  isActive
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)] font-semibold'
                    : 'bg-black/40 text-fuchsia-400 border border-fuchsia-950/40 hover:bg-pink-500/10 hover:text-pink-300'
                }`
              : themeId === 'nordic'
              ? `rounded-xl ${
                  isActive
                    ? 'bg-stone-200 text-stone-900 border border-stone-400 font-semibold'
                    : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200/80 hover:text-stone-800'
                }`
              : themeId === 'cyberpunk'
              ? `rounded-none border-2 border-[#fcee0a] ${
                  isActive
                    ? 'bg-[#fcee0a] text-black font-black shadow-[3px_3px_0px_rgba(252,238,10,0.3)]'
                    : 'bg-[#121216] text-[#fcee0a] hover:bg-[#fcee0a]/10'
                }`
              : themeId === 'sakura'
              ? `rounded-full border ${
                  isActive
                    ? 'bg-rose-100 text-rose-800 border-rose-300 font-semibold'
                    : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50/50 hover:text-rose-700'
                }`
              : `rounded-xl ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-800/40 text-slate-400 border border-slate-800/60 hover:bg-slate-800/80 hover:text-slate-200'
                }`;

          return (
            <motion.button
              id={`glyph-preset-btn-${presetKey}`}
              key={presetKey}
              onClick={() => handleGlyphChange(presetKey)}
              whileHover={{ scale: themeId === 'brutalist' ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center justify-between py-2 px-3 text-xs transition-colors cursor-pointer select-none truncate ${rawSelectStyles}`}
            >
              <span className="font-semibold truncate mr-1">{preset.name.split(' ')[0]}</span>
              <span className="flex items-center gap-1 font-mono font-bold shrink-0 opacity-90">
                <span className="px-1 bg-stone-500/10 rounded">{preset.xLabel}</span>
                <span className="opacity-45">:</span>
                <span className="px-1 bg-stone-500/10 rounded">{preset.oLabel}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
