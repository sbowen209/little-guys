// src/data/gil/tiers.js
// Tier palette — the sheet's main source of colour. Kept apart from the
// components so fast refresh stays happy. Class strings are literal so
// Tailwind's scanner keeps them.

export const TIER = {
  Essential:    { name: 'text-emerald-200', label: 'text-emerald-500', pip: 'bg-emerald-400' },
  Minor:        { name: 'text-sky-200',     label: 'text-sky-500',     pip: 'bg-sky-400' },
  Intermediate: { name: 'text-amber-200',   label: 'text-amber-500',   pip: 'bg-amber-400' },
  Advanced:     { name: 'text-rose-200',    label: 'text-rose-500',    pip: 'bg-rose-400' },
};

// Aida is Spirit-aligned.
export const SPIRIT_TIER = {
  name: 'text-fuchsia-200', label: 'text-fuchsia-500', pip: 'bg-fuchsia-400',
  soft: 'text-fuchsia-300', strong: 'text-fuchsia-400', focus: 'focus:border-fuchsia-500',
};

// Kitana is Shadow-aligned.
export const SHADOW_TIER = {
  name: 'text-violet-200', label: 'text-violet-500', pip: 'bg-violet-400',
  soft: 'text-violet-300', strong: 'text-violet-400', focus: 'focus:border-violet-500',
};

export const SHORT_TYPE = { Intermediate: 'Int', Essential: 'Essential', Minor: 'Minor', Advanced: 'Adv' };
