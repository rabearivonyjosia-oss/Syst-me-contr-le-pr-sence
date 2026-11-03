import { useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Liste déroulante — mêmes règles que Input (étiquette visible, erreur précise).
 */
function Select({
  label,
  id,
  error,
  hint,
  required = false,
  className = '',
  children,
  ...props
}) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-erreur`;
  const hintId = `${selectId}-aide`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={selectId} className="block text-sm font-semibold text-slate-800">
        {label}
        {required && (
          <span className="text-danger-700" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full appearance-none rounded-app border bg-white py-2 pl-4 pr-11 text-base text-slate-900 shadow-card transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600 ${
            error ? 'border-danger-700' : 'border-slate-300'
          }`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 h-5 w-5 text-slate-500"
        />
      </div>

      {hint && !error && (
        <p id={hintId} className="text-sm text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-danger-800">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default Select;
