import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(
  ({ label, error, type = 'text', className = '', icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-2.5 rounded-md
              bg-bg-secondary border border-border
              text-text-primary placeholder-text-muted
              transition-all duration-200
              focus:border-gold focus:ring-2 focus:ring-gold-light
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error focus:border-error focus:ring-error-light' : ''}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input ;