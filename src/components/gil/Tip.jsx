// src/components/gil/Tip.jsx
// Lightweight hover/tap tooltip that renders through a portal so it is never
// clipped by scroll containers. Positions itself above the trigger, flipping
// below when there isn't room, and clamps to the viewport.
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Tip({ content, title, children, className = '', as: Tag = 'span', accent }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // {top,left} | null until measured
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !bubbleRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const b = bubbleRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 8;
    let top = t.top - b.height - gap;
    if (top < gap) top = Math.min(t.bottom + gap, vh - b.height - gap);
    let left = t.left + t.width / 2 - b.width / 2;
    left = Math.max(gap, Math.min(left, vw - b.width - gap));
    setPos({ top, left });
  }, [open, content, title]);

  const openTip = () => { setPos(null); setOpen(true); };
  const closeTip = () => setOpen(false);

  if (!content) return <Tag className={className}>{children}</Tag>;

  return (
    <Tag
      ref={triggerRef}
      className={className}
      onMouseEnter={openTip}
      onMouseLeave={closeTip}
      onFocus={openTip}
      onBlur={closeTip}
      onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      tabIndex={0}
    >
      {children}
      {open && createPortal(
        <div
          ref={bubbleRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: pos ? pos.top : -9999,
            left: pos ? pos.left : -9999,
            opacity: pos ? 1 : 0,
            zIndex: 100,
            maxWidth: 'min(340px, calc(100vw - 16px))',
          }}
          className="pointer-events-none rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs leading-relaxed text-neutral-300 shadow-2xl shadow-black/80"
        >
          {title && (
            <div className={`mb-1 text-[11px] font-semibold tracking-wide ${accent || 'text-neutral-100'}`}>{title}</div>
          )}
          <div className="whitespace-pre-line">{content}</div>
        </div>,
        document.body,
      )}
    </Tag>
  );
}
