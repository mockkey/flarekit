import { Input } from '@flarekit/ui/components/ui/input';
import { Label } from '@flarekit/ui/components/ui/label';
import { Link } from 'react-router';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  error,
  disabled,
  defaultValue,
  action
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        {action && (
          <Link
            to={action.href}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {action.label}
          </Link>
        )}
      </div>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={error}
        className={error ? "border-red-500" : undefined}
      />
    </div>
  );
}
