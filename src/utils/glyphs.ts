import { GlyphPreset, GlyphPresetId } from '../types';

export const GLYPH_PRESETS: Record<GlyphPresetId, GlyphPreset> = {
  classic: {
    id: 'classic',
    name: 'Classic Standard',
    xLabel: 'X',
    oLabel: 'O',
  },
  ethereal: {
    id: 'ethereal',
    name: 'Cosmic Glyphs',
    xLabel: '✦',
    oLabel: '⬡',
  },
  retro: {
    id: 'retro',
    name: 'Retro Shapes',
    xLabel: '▲',
    oLabel: '■',
  },
  fighter: {
    id: 'fighter',
    name: 'Fighter Duel',
    xLabel: '⚔',
    oLabel: '🛡',
  },
};
