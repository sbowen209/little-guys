// src/components/gil/ui.jsx
// Shared primitives for the character sheets — kept in one place so Gil's sheet
// and the ally sheets stay visually identical.
import Tip from './Tip';

export function Stepper({ value, onDec, onInc, tone = 'text-neutral-100' }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onDec} className="grid h-6 w-6 place-items-center rounded border border-neutral-800 text-sm leading-none text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200 active:scale-90" aria-label="decrease">−</button>
      <span className={`w-6 text-center font-mono text-sm font-semibold tabular-nums ${value === 0 ? 'text-neutral-600' : tone}`}>{value}</span>
      <button onClick={onInc} className="grid h-6 w-6 place-items-center rounded border border-neutral-800 text-sm leading-none text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200 active:scale-90" aria-label="increase">+</button>
    </div>
  );
}

// Charge pips. A charge is spent when its pip is hollow; click to spend/restore.
export function Charges({ total, used, onSet, tier }) {
  if (total == null) {
    return <span className="font-mono text-[13px] leading-none text-neutral-700" title="No charge limit">∞</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => {
        const spent = i < used;
        return (
          <button
            key={i}
            onClick={() => onSet(i < used ? i : i + 1)}
            title={spent ? 'Restore charge' : 'Spend charge'}
            aria-label={spent ? 'Restore charge' : 'Spend charge'}
            className={`h-3.5 w-3.5 rounded-full border transition hover:scale-125 ${spent ? 'border-neutral-700 bg-transparent' : `${tier.pip} border-transparent`}`}
          />
        );
      })}
    </div>
  );
}

export function Section({ title, right, children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-neutral-800 pb-1.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

// A name you can hover for its rules text — dotted underline signals it.
export function HoverName({ title, desc, accent, className = '' }) {
  return (
    <Tip content={desc} title={title} accent={accent} className="inline-block cursor-help">
      <span className={`border-b border-dotted border-neutral-700 transition hover:border-neutral-400 ${className}`}>{title}</span>
    </Tip>
  );
}
