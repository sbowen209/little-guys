// src/components/gil/AllySheet.jsx
// An ally's play sheet — same language as Gil's: black ground, hairline rules,
// charge pips, rules text in tooltips.
import { assetUrl } from '../../utils/assets';
import { Section, HoverName, Charges } from './ui';
import { SPIRIT_TIER } from '../../data/gil/tiers';

export default function AllySheet({ ally, battery, onBattery, uses, onUse }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[272px_1fr]">
      {/* left rail */}
      <aside className="space-y-5 lg:sticky lg:top-14 lg:self-start">
        <div>
          <img
            src={assetUrl(ally.image)}
            alt={ally.name}
            className="h-56 w-full rounded border border-neutral-800 object-cover object-top"
          />
          {ally.imagePlaceholder && (
            <p className="mt-1 text-[10px] italic text-neutral-600">placeholder art — swap when Aida's portrait exists</p>
          )}
          <h1 className="mt-2 text-3xl font-semibold leading-none text-neutral-50">{ally.name}</h1>
          <p className="mt-1 text-[11px] text-fuchsia-500/90">{ally.role}</p>
        </div>

        <Section title="Ether Battery">
          <div className="rounded border border-neutral-800">
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <span className="text-[12px] text-neutral-400">Battery</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={battery}
                  onChange={(e) => onBattery(Number(e.target.value))}
                  className="w-14 rounded border border-neutral-800 bg-black px-1 py-0.5 text-right font-mono text-sm font-semibold tabular-nums text-fuchsia-400 outline-none focus:border-fuchsia-500"
                />
                <span className="font-mono text-[11px] text-neutral-600">/ {ally.battery.start}</span>
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-neutral-600">{ally.statsNote}</p>
        </Section>

        <Section title="Passives">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ally.passives.map((p) => (
              <HoverName
                key={p.name}
                title={p.name}
                desc={p.desc}
                accent="text-fuchsia-300"
                className={`text-[12px] ${p.type === 'Affinity' ? 'text-fuchsia-400' : 'text-neutral-400'}`}
              />
            ))}
          </div>
        </Section>
      </aside>

      {/* right */}
      <div className="min-w-0 space-y-5">
        <Section title="Techniques" right={<span className="text-[10px] text-neutral-600">click a pip to spend a use</span>}>
          <div className="overflow-hidden rounded border border-neutral-800">
            <div className="grid grid-cols-[86px_1fr] items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              <span>Uses</span><span>Technique</span>
            </div>
            {ally.techniques.map((t) => (
              <div key={t.name} className="grid grid-cols-[86px_1fr] items-center gap-2 border-b border-neutral-900 px-2.5 py-1.5 transition last:border-b-0 hover:bg-neutral-950">
                <Charges total={t.charges} used={uses[t.name] || 0} tier={SPIRIT_TIER} onSet={(v) => onUse(t.name, v)} />
                <HoverName title={t.name} desc={t.desc} accent={SPIRIT_TIER.name} className={`text-sm font-medium ${SPIRIT_TIER.name}`} />
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-5 xl:grid-cols-2">
          <Section title="Ether Battery Actions" right={<span className="text-[10px] text-neutral-600">cost</span>}>
            <div className="overflow-hidden rounded border border-neutral-800">
              {ally.batterySpends.map((s) => (
                <div key={s.name} className="flex items-center gap-3 border-b border-neutral-900 px-2.5 py-1.5 last:border-b-0 hover:bg-neutral-950">
                  <span className="w-7 shrink-0 text-right font-mono text-[11px] font-semibold text-fuchsia-500">{s.cost}</span>
                  <HoverName title={s.name} desc={s.desc} accent="text-fuchsia-300" className="text-[13px] text-neutral-200" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Halo Drone Abilities">
            <div className="overflow-hidden rounded border border-neutral-800">
              {ally.droneAbilities.map((d) => (
                <div key={d.n} className="flex items-center gap-3 border-b border-neutral-900 px-2.5 py-1.5 last:border-b-0 hover:bg-neutral-950">
                  <span className="w-3 shrink-0 font-mono text-[10px] text-neutral-600">{d.n}</span>
                  <HoverName title={d.name} desc={d.desc} accent="text-fuchsia-300" className="text-[13px] text-neutral-200" />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-600">{ally.droneNote}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
