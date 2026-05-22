import { motion } from 'motion/react';
import { ThemeId, GameTheme } from '../types';
import { THEMES } from '../utils/themes';
import { Sparkles, Compass, Moon, Terminal, Cpu, Leaf } from 'lucide-react';
import { playToggleSound } from '../utils/sound';

interface ThemeSelectorProps {
  currentThemeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
}

export default function ThemeSelector({ currentThemeId, onThemeChange }: ThemeSelectorProps) {
  
  const handleThemeChange = (id: ThemeId) => {
    playToggleSound();
    onThemeChange(id);
  };

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'slate':
        return <Moon className="w-4 h-4" />;
      case 'synthwave':
        return <Sparkles className="w-4 h-4" />;
      case 'nordic':
        return <Compass className="w-4 h-4" />;
      case 'brutalist':
        return <Terminal className="w-4 h-4" />;
      case 'cyberpunk':
        return <Cpu className="w-4 h-4" />;
      case 'sakura':
        return <Leaf className="w-4 h-4" />;
    }
  };

  const currentTheme = THEMES[currentThemeId];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold tracking-wider uppercase opacity-80 ${currentTheme.fontFamily}`}>
          Visual Style
        </span>
        <span className={`text-xs font-mono font-medium ${currentTheme.accentColor}`}>
          {THEMES[currentThemeId].name}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 items-center gap-2 w-full">
        {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
          const theme = THEMES[themeKey];
          const isActive = themeKey === currentThemeId;

          // Compute consistent styling based on the active app theme
          const rawSelectStyles =
            currentThemeId === 'brutalist'
              ? `${
                  isActive
                    ? 'bg-[#ffff00] border-4 border-black text-black font-extrabold shadow-[2px_2px_0px_#000000] rounded-none'
                    : 'bg-white border-2 border-black text-black font-bold active:translate-x-[1px] active:translate-y-[1px] rounded-none'
                }`
              : currentThemeId === 'synthwave'
              ? `rounded-xl ${
                  isActive
                    ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)] font-semibold'
                    : 'bg-black/40 text-fuchsia-400 border border-fuchsia-950/40 hover:bg-pink-500/10 hover:text-pink-300'
                }`
              : currentThemeId === 'nordic'
              ? `rounded-xl ${
                  isActive
                    ? 'bg-stone-200 text-stone-900 border border-stone-400 font-semibold'
                    : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200/80 hover:text-stone-800'
                }`
              : currentThemeId === 'cyberpunk'
              ? `rounded-none border-2 border-[#fcee0a] ${
                  isActive
                    ? 'bg-[#fcee0a] text-black font-black shadow-[3px_3px_0px_rgba(252,238,10,0.3)]'
                    : 'bg-[#121216] text-[#fcee0a] hover:bg-[#fcee0a]/10'
                }`
              : currentThemeId === 'sakura'
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
              id={`theme-btn-${themeKey}`}
              key={themeKey}
              onClick={() => handleThemeChange(themeKey)}
              whileHover={{ scale: currentThemeId === 'brutalist' ? 1 : 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs transition-colors cursor-pointer select-none flex-grow shrink-0 truncate ${rawSelectStyles}`}
            >
              <span className="shrink-0">{getThemeIcon(themeKey)}</span>
              <span className="font-semibold">{theme.name.split(' ')[0]}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
