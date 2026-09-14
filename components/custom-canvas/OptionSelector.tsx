'use client';

export interface SelectableOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface OptionSelectorProps {
  label: string;
  options: SelectableOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage?: string;
}

export function OptionSelector({
  label,
  options,
  selectedId,
  onSelect,
  emptyMessage,
}: OptionSelectorProps) {
  if (options.length === 0) {
    return (
      <div>
        <h3 className="text-xs sm:text-sm font-semibold">{label}</h3>
        <p className="mt-2 text-xs text-muted">
          {emptyMessage ?? 'No options configured yet — add these in Admin.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs sm:text-sm font-semibold">{label}</h3>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt.id)}
              className={`rounded-card border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all max-w-full text-left truncate ${
                isSelected
                  ? 'border-amber-600 bg-amber-500/15 font-semibold text-amber-600 ring-1 ring-amber-500/30'
                  : 'border-border bg-surface hover:border-text/30'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.sublabel && (
                <span className="ml-1 text-xs text-muted opacity-80">{opt.sublabel}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
