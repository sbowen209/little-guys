// src/components/Hearts.jsx
export default function Hearts({ hp, max = 5, size = 'text-xl' }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`${size} leading-none transition-colors ${
            i < hp ? 'text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]' : 'text-stone-700'
          }`}
        >
          {i < hp ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
}