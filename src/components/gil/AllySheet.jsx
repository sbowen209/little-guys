// src/components/gil/AllySheet.jsx
// An ally's play sheet — same language as Gil's: black ground, hairline rules,
// charge pips, rules text in tooltips. Sections render only when the ally has
// that data (stats, battery actions, drones), and colour follows `ally.tier`.
import { assetUrl } from '../../utils/assets';
import { Section, HoverName, Charges } from './ui';

function TechniqueTable({ techniques, tier, uses, onUse }) {
  return (
    <div className="overflow-hidden rounded border border-neutral-800">
      <div className="grid grid-cols-[86px_1fr] items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        <span>Uses</span><span>Technique</span>
      </div>
      {techniques.map((t) => {
        const spentOut = t.charges != null && (uses[t.name] || 0) >= t.charges;
        return (
          <div key={t.name} className="grid grid-cols-[86px_1fr] items-center gap-2 border-b border-neutral-900 px-2.5 py-1.5 transition last:border-b-0 hover:bg-neutral-950">
            <Charges total={t.charges} used={uses[t.name] || 0} tier={tier} onSet={(v) => onUse(t.name, v)} />
            <HoverName title={t.name} desc={t.desc} accent={tier.name}
              className={`text-sm font-medium ${tier.name} ${spentOut ? 'opacity-40' : ''}`} />
          </div>
        );
      })}
    </div>
  );
}

export default function AllySheet({ ally, resource, onResource, uses, onUse }) {
  const { tier } = ally;
  const groups = [...new Set(ally.techniques.map((t) => t.group || null))];
  const pipHint = <span className="text-[10px] text-neutral-600">click a pip to spend a use</span>;

  return (
    <div className="grid gap-5 lg:grid-cols-[272px_1fr]">
      {/* left rail */}
      <aside className="space-y-5 lg:sticky lg:top-14 lg:self-start">
        <div>
          <img
            src={assetUrl(ally.image)}
            alt={ally.name}
            className="aspect-[3/4] w-full rounded border border-neutral-800 bg-neutral-950 object-contain p-1"
          />
          {ally.imagePlaceholder && (
            <p className="mt-1 text-[10px] italic text-neutral-600">placeholder art — swap when {ally.name}'s portrait exists</p>
          )}
          <h1 className="mt-2 text-3xl font-semibold leading-none text-neutral-50">{ally.name}</h1>
          <p className={`mt-1 text-[11px] ${tier.label}`}>{ally.role}</p>
        </div>

        {ally.stats && (
          <Section title="Stats">
            <div className="rounded border border-neutral-800">
              {ally.stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-neutral-900 px-2.5 py-1 last:border-b-0">
                  <span className="text-[12px] text-neutral-400">{s.label}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-neutral-100">{s.value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title={ally.resource.label}>
          <div className="rounded border border-neutral-800">
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <span className="text-[12px] text-neutral-400">Current</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={resource}
                  onChange={(e) => onResource(Number(e.target.value))}
                  className={`w-14 rounded border border-neutral-800 bg-black px-1 py-0.5 text-right font-mono text-sm font-semibold tabular-nums outline-none ${tier.strong} ${tier.focus}`}
                />
                <span className="font-mono text-[11px] text-neutral-600">/ {ally.resource.start}</span>
              </div>
            </div>
          </div>
          {(ally.resource.note || ally.statsNote) && (
            <p className="mt-1.5 text-[10px] text-neutral-600">{ally.resource.note || ally.statsNote}</p>
          )}
        </Section>

        <Section title="Passives">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ally.passives.map((p) => (
              <HoverName
                key={p.name}
                title={p.name}
                desc={p.type === 'Passive' ? p.desc : `${p.type} — ${p.desc}`}
                accent={tier.soft}
                className={`text-[12px] ${p.type === 'Affinity' ? tier.strong : 'text-neutral-400'}`}
              />
            ))}
          </div>
        </Section>
      </aside>

      {/* right */}
      <div className="min-w-0 space-y-5">
        <div className={groups.length > 1 ? 'grid gap-5 xl:grid-cols-2' : ''}>
          {groups.map((g, i) => (
            <Section key={g || 'all'} title={g ? `${g} Techniques` : 'Techniques'} right={i === 0 ? pipHint : null}>
              <TechniqueTable techniques={ally.techniques.filter((t) => (t.group || null) === g)} tier={tier} uses={uses} onUse={onUse} />
            </Section>
          ))}
        </div>

        {(ally.batterySpends || ally.droneAbilities) && (
          <div className="grid gap-5 xl:grid-cols-2">
            {ally.batterySpends && (
              <Section title={`${ally.resource.label} Actions`} right={<span className="text-[10px] text-neutral-600">cost</span>}>
                <div className="overflow-hidden rounded border border-neutral-800">
                  {ally.batterySpends.map((s) => (
                    <div key={s.name} className="flex items-center gap-3 border-b border-neutral-900 px-2.5 py-1.5 last:border-b-0 hover:bg-neutral-950">
                      <span className={`w-7 shrink-0 text-right font-mono text-[11px] font-semibold ${tier.label}`}>{s.cost}</span>
                      <HoverName title={s.name} desc={s.desc} accent={tier.soft} className="text-[13px] text-neutral-200" />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {ally.droneAbilities && (
              <Section title="Halo Drone Abilities">
                <div className="overflow-hidden rounded border border-neutral-800">
                  {ally.droneAbilities.map((d) => (
                    <div key={d.n} className="flex items-center gap-3 border-b border-neutral-900 px-2.5 py-1.5 last:border-b-0 hover:bg-neutral-950">
                      <span className="w-3 shrink-0 font-mono text-[10px] text-neutral-600">{d.n}</span>
                      <HoverName title={d.name} desc={d.desc} accent={tier.soft} className="text-[13px] text-neutral-200" />
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-600">{ally.droneNote}</p>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
