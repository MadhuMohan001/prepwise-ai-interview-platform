import { Check } from 'lucide-react';
import { difficulties } from '../data/practiceData.js';

function DifficultySelector({ value, onChange, compact = false, disabled = false }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-slate-800">Choose difficulty</legend>
      <div className={`grid grid-cols-3 gap-2 ${compact ? '' : 'sm:gap-3'}`}>
        {difficulties.map((difficulty) => {
          const selected = value === difficulty;

          return (
            <button
              key={difficulty}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(difficulty)}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {selected && <Check aria-hidden="true" size={15} />}
              {difficulty}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default DifficultySelector;
