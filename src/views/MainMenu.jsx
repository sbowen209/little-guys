// src/views/MainMenu.jsx
import { useState } from 'react';
import { HEROES } from '../data/heroes';
import { ENEMIES } from '../data/enemies';
import { PASSIVES } from '../data/passives';
import { getElement, heroAura } from '../data/elements';

const ZONE_ACCENT = { toxic: 'text-emerald-400', poison: 'text-fuchsia-400' };
const ARTWORK_SCALE = { marinska: 1.06, crocagator: 1.1 };
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

/* ── SUB-COMPONENTS ──────────────────────────────────────────── */
function StatBadge({ icon, label, value, tone }) {
  const tones = {
    health: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    attack: 'bg-slate-400/15 text-slate-200 ring-slate-400/30',
    danger: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  };
  return (
    <div className="flex min-w-[120px] items-center gap-3 rounded-xl border border-stone-700/80 bg-stone-900/70 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-black ring-1 ${tones[tone]}`}>{icon}</div>
      <div>
        <span className="block font-mono text-[10px] uppercase tracking-widest text-stone-500">{label}</span>
        <span className="block font-mono text-2xl font-black leading-tight text-white tabular-nums">{value}</span>
      </div>
    </div>
  );
}

/** Full-text passive row sourced from passives.js. */
function PassiveItem({ id }) {
  const def = PASSIVES[id];
  return (
    <li className="rounded-lg border border-stone-700/70 bg-stone-900/60 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-amber-500">✦</span>
        <span className="font-serif font-bold tracking-wide text-stone-100">{def?.name ?? id}</span>
      </div>
      <p className="mt-1 pl-6 text-sm leading-snug text-stone-400">
        {def?.desc ?? 'Ability details are lost to legend.'}
      </p>
    </li>
  );
}

/** Element aura — wider, taller, deeply blurred for a subtle environmental wash. */
function HeroAura({ elements = [] }) {
  const aura = heroAura(elements);
  if (!aura) return null;
  return (
    <div
      className={`pointer-events-none absolute bottom-[6%] left-1/2 h-[80%] w-[90%] -translate-x-1/2 rounded-full blur-[100px] ${
        aura.mono ? 'animate-pulse' : 'animate-[spinAura_9s_linear_infinite]'
      }`}
      style={{ background: aura.background, opacity: 0.25 }}
    />
  );
}

function CarouselCard({ entity, imgSrc, isSelected, accent, showBiome, onSelect }) {
  const selectedRing =
    accent === 'amber'
      ? 'border-amber-400 shadow-[0_0_22px_-2px_rgba(251,191,36,0.55)]'
      : 'border-rose-500 shadow-[0_0_22px_-2px_rgba(244,63,94,0.55)]';

  const colors = (entity.elements || []).map((e) => getElement(e).hex);
  let affinityStyle = {};
  if (colors.length === 1) {
    affinityStyle = { background: colors[0] };
  } else if (colors.length >= 2) {
    affinityStyle = { background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)` };
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group relative h-24 w-44 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        isSelected ? `${selectedRing} -translate-y-1 scale-105` : 'border-stone-800 opacity-60 hover:-translate-y-1 hover:border-stone-600 hover:opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-stone-900" />
      <img src={imgSrc} alt={entity.name} loading="lazy" draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-40 mix-blend-luminosity transition-all duration-500 group-hover:scale-110 group-hover:opacity-70 group-hover:mix-blend-normal" />
      
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
        }`}
        style={affinityStyle}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
      <div className="absolute inset-x-3 bottom-2 z-10 text-left">
        <div className={`truncate font-serif text-base font-bold leading-tight ${isSelected ? 'text-white' : 'text-stone-300'}`}>{entity.name}</div>
        {showBiome && <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-stone-500">{entity.biome}</div>}
      </div>
      {isSelected && <span className={`absolute right-2 top-2 z-10 h-2 w-2 animate-pulse rounded-full ${accent === 'amber' ? 'bg-amber-400' : 'bg-rose-500'}`} />}
    </button>
  );
}

function ShowcaseImage({ src, alt, accent, scale = 1 }) {
  const [loaded, setLoaded] = useState(false);
  const handleRef = (node) => { if (node && node.complete && node.naturalWidth > 0 && !loaded) setLoaded(true); };
  const spinnerColor = accent === 'amber' ? 'border-amber-500/50' : 'border-rose-500/50';
  return (
    <div className="relative z-10 flex h-full w-full animate-[float_7s_ease-in-out_infinite] items-end justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`h-14 w-14 animate-spin rounded-full border-4 border-t-transparent ${spinnerColor}`} />
        </div>
      )}
      <div className="absolute bottom-[5%] h-10 w-1/2 rounded-full bg-black/60 blur-2xl" />
      <img
        ref={handleRef} src={src} alt={alt} draggable={false}
        onLoad={() => setLoaded(true)} onError={() => setLoaded(true)}
        style={{ transform: `scale(${loaded ? scale : scale * 0.95})` }}
        className={`h-full max-h-full w-full select-none object-contain object-bottom drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)] transition-[opacity,transform] duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

/* ── MAIN VIEW ───────────────────────────────────────────────── */
export default function MainMenu({ onStartRun, onOpenStats }) {
  const heroes = Object.values(HEROES);
  const enemies = Object.values(ENEMIES);

  const [activeTab, setActiveTab] = useState('heroes');
  const [selectedHero, setSelectedHero] = useState(heroes[0]);
  const [selectedEnemy, setSelectedEnemy] = useState(enemies[0]);

  const isHeroes = activeTab === 'heroes';
  const accent = isHeroes ? 'amber' : 'rose';
  const activeEntity = isHeroes ? selectedHero : selectedEnemy;
  const roster = isHeroes ? heroes : enemies;

  const heroSubtitle = {
    gil: 'Campaign Hero',
    marinska: 'Vampyre Descendent',
    tornadowerewolf: 'Tornado Werewolf',
    crocagator: 'Lizard Bastard',
    shiva: 'Battle Beast',
  }[activeEntity.id] || 'Campaign Hero';

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-stone-950 font-sans text-stone-200 selection:bg-amber-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-indigo-900/20 mix-blend-screen blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-900/10 mix-blend-screen blur-[150px]" />

      <header className="relative z-50 flex shrink-0 items-start justify-between p-6 lg:p-8">
        <div>
          <h1 className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text font-serif text-4xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)] lg:text-5xl">
            LITTLE GUYS
          </h1>
          <nav className="mt-5 flex gap-3">
            <button type="button" onClick={() => setActiveTab('heroes')}
              className={`rounded-lg border-b-2 px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${isHeroes ? 'border-amber-400 bg-stone-800/80 text-amber-400 shadow-[0_4px_20px_-5px_rgba(251,191,36,0.4)]' : 'border-transparent bg-stone-900/50 text-stone-500 hover:bg-stone-800/50 hover:text-stone-300'}`}>
              Heroes
            </button>
            <button type="button" onClick={() => setActiveTab('bestiary')}
              className={`rounded-lg border-b-2 px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${!isHeroes ? 'border-rose-500 bg-stone-800/80 text-rose-400 shadow-[0_4px_20px_-5px_rgba(244,63,94,0.4)]' : 'border-transparent bg-stone-900/50 text-stone-500 hover:bg-stone-800/50 hover:text-stone-300'}`}>
              Bestiary
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onOpenStats}
            className="rounded-lg border border-stone-700 px-5 py-3 text-sm font-bold uppercase tracking-widest text-stone-300 transition hover:border-stone-500 hover:text-white">
            Records
          </button>
          <button type="button" onClick={onStartRun}
            className="group relative overflow-hidden rounded-sm bg-amber-500 px-8 py-4 font-black uppercase tracking-widest text-stone-950 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] lg:px-10">
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/30 group-hover:animate-[shine_0.7s_ease-out]" />
            <span className="relative">Embark</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-[58%] items-end justify-center">
          {isHeroes && <HeroAura elements={activeEntity.elements} />}
          <ShowcaseImage
            key={`${activeTab}-${activeEntity.id}`}
            src={assetUrl(activeEntity.imagePath)}
            alt={activeEntity.name}
            accent={accent}
            scale={ARTWORK_SCALE[activeEntity.id] ?? 1}
          />
        </div>

        {/* Info panel */}
        <div className="absolute inset-y-0 left-0 z-20 flex w-full max-w-2xl flex-col justify-center px-8 lg:px-12">
          <p className={`mb-2 font-mono text-sm uppercase tracking-[0.3em] ${isHeroes ? 'text-amber-500' : 'text-rose-500'}`}>
            {isHeroes ? heroSubtitle : `${activeEntity.biome} Encounter`}
          </p>

          <h2 className="mb-3 font-serif text-6xl font-black leading-none tracking-tight text-white drop-shadow-xl lg:text-7xl">
            {activeEntity.name}
          </h2>

          {isHeroes && activeEntity.elements && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeEntity.elements.map((e) => {
                const el = getElement(e);
                return (
                  <span key={e}
                    className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{ color: el.hex, borderColor: `${el.hex}88`, backgroundColor: `${el.hex}1a` }}>
                    {el.name}
                  </span>
                );
              })}
            </div>
          )}

          {isHeroes && (
            <p className="mb-6 max-w-xl border-l-2 border-stone-700 pl-4 text-lg italic text-stone-400">
              "{activeEntity.description}"
            </p>
          )}

          <div className="mb-7 flex gap-5">
            <StatBadge icon="♥" label="Health" value={activeEntity.baseHealth} tone={isHeroes ? 'health' : 'danger'} />
            <StatBadge icon="⚔" label="Attack" value={activeEntity.baseAttack} tone="attack" />
          </div>

          {isHeroes ? (
            <div>
              <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Passives</h3>
              <ul className="flex max-w-xl flex-col gap-2">
                {activeEntity.passives.map((p) => <PassiveItem key={p} id={p} />)}
              </ul>
            </div>
          ) : (
            <div className="max-w-md rounded-xl border border-rose-900/30 bg-stone-900/60 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Combat Intelligence</h3>
              <dl className="space-y-4">
                <div className="flex justify-between border-b border-stone-800 pb-2">
                  <dt className="text-stone-400">Habitat / Zone</dt>
                  <dd className="font-medium capitalize text-stone-200">
                    {activeEntity.biome} •{' '}
                    <span className={ZONE_ACCENT[activeEntity.zoneType] ?? 'text-stone-200'}>{activeEntity.zoneType}</span>
                  </dd>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-2">
                  <dt className="text-stone-400">Escalation Threat</dt>
                  <dd className="font-mono font-medium text-rose-400">+{activeEntity.healthPerLevel} HP / +{activeEntity.attackPerLevel} ATK</dd>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <dt className="text-stone-400">Special Tactic</dt>
                  <dd className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-sm tracking-wider text-rose-300">
                    {activeEntity.ability.replace(/_/g, ' ')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>

      <section className="relative z-30 shrink-0 px-6 pb-6 lg:px-8">
        <h3 className="mb-3 pl-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
          Select {isHeroes ? 'Hero' : 'Target'}
        </h3>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-stone-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-stone-950 to-transparent" />
          <div className="custom-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-2 pb-3 pt-2">
            {roster.map((entity) => (
              <CarouselCard
                key={entity.id}
                entity={entity}
                imgSrc={assetUrl(entity.imagePath)}
                isSelected={activeEntity.id === entity.id}
                accent={accent}
                showBiome={!isHeroes}
                onSelect={() => (isHeroes ? setSelectedHero(entity) : setSelectedEnemy(entity))}
              />
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine { to { transform: translateX(220%) skewX(-12deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes spinAura { to { transform: translateX(-50%) rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(120,113,108,0.4); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(120,113,108,0.7); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(120,113,108,0.4) transparent; }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[float_7s_ease-in-out_infinite\\], .animate-\\[spinAura_9s_linear_infinite\\],
          .group-hover\\:animate-\\[shine_0\\.7s_ease-out\\] { animation: none !important; }
        }
      `}} />
    </div>
  );
}