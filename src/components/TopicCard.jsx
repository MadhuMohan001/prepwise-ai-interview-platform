function TopicCard({ topic, selected, onSelect, disabled = false }) {
  const { name, description, Icon, color } = topic;
  const iconStyles = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`group rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
      }`}
    >
      <span className={`mb-4 grid size-11 place-items-center rounded-xl ${iconStyles[color]}`}>
        <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
      </span>
      <span className="block font-semibold text-slate-900">{name}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
    </button>
  );
}

export default TopicCard;
