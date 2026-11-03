import { useId } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Champ de saisie avec étiquette TOUJOURS visible (jamais placeholder seul),
 * message d'erreur précis sous le champ et association label ↔ champ (htmlFor/id).
 */
function Input({
  label,
  id,
  type = 'text',
  error,
  hint,
  leadingIcon: LeadingIcon,
  trailing,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-erreur`;
  const hintId = `${inputId}-aide`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800">
        {label}
        {required && (
          <span className="text-danger-700" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        {LeadingIcon && (
          <LeadingIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-500"
          />
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-app border bg-white py-2 text-base text-slate-900 shadow-card transition-colors placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600 ${
            LeadingIcon ? 'pl-11' : 'pl-4'
          } ${trailing ? 'pr-12' : 'pr-4'} ${
            error ? 'border-danger-700' : 'border-slate-300'
          } ${inputClassName}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-1.5 flex items-center">{trailing}</div>
        )}
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

export default Input;
