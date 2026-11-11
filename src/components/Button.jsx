function Button({ children, variant = 'primary', className = '', ...props }) {
  const variantClass =
    variant === 'secondary'
      ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      : variant === 'quiet'
        ? 'bg-transparent text-slate-600 hover:bg-slate-100'
        : variant === 'inverse'
          ? 'bg-white text-indigo-800 hover:bg-indigo-50'
          : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700';

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
