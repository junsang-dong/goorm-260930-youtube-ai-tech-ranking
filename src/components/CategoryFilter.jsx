import { CATEGORIES } from '../../shared/categories.js';

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {CATEGORIES.map((category) => {
        const active = category.code === value;
        return (
          <button
            key={category.code}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category.code)}
            className={`min-h-11 shrink-0 rounded-full px-3.5 text-xs font-semibold transition active:scale-95 ${
              active
                ? 'bg-accent text-white shadow-card'
                : 'bg-surface-container text-muted hover:text-ink'
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
