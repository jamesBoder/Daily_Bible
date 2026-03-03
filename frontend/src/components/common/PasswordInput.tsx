// imports
import React from 'react';

interface PasswordRequirementDef {
  label: string;
  test: (password: string) => boolean;
}

// Static requirement definitions — defined outside component to avoid re-creation on every render
const PASSWORD_REQUIREMENTS: PasswordRequirementDef[] = [
  { label: 'At least 8 characters',      test: (pw) => pw.length >= 8 },
  { label: 'Contains uppercase letter',  test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Contains lowercase letter',  test: (pw) => /[a-z]/.test(pw) },
  { label: 'Contains number',            test: (pw) => /[0-9]/.test(pw) },
  { label: 'Contains special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

interface PasswordInputProps {
  label: string;
  value: string;
  name?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showRequirements?: boolean;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

// PasswordInput component // Display password requirements // Real-time validation // Visual State Indicators
export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  showRequirements = false,
  error,
  required,
  ...props
}) => {
  // Derive met status directly from value — no useState/useEffect needed
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.test(value),
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={onChange}
        name={props.name}
        placeholder={props.placeholder}
        required={required}
        autoComplete={props.autoComplete}
        className={`mt-1 block w-full px-3 py-2 border ${
          error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600'
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showRequirements && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password Requirements:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {requirements.map((req, index) => (
              <li
                key={index}
                className={`text-sm ${
                  req.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {req.met ? '✔️' : '❌'} {req.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

  