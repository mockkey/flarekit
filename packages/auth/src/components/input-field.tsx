import { Input } from "@flarekit/ui/components/ui/input";
import { Label } from "@flarekit/ui/components/ui/label";
import { Link } from "react-router";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string[];
  action?: {
    label: string;
    href: string;
  };
}

export function InputField({
  label,
  errorMessage,
  action,
  className,
  ...props
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={props.name}>{label}</Label>
        {action && (
          <Link to={action.href}>
            <span className="text-sm text-muted-foreground hover:text-primary">
              {action.label}
            </span>
          </Link>
        )}
      </div>
      <Input
        {...props}
        className={`${className} ${errorMessage ? "border-destructive" : ""}`}
      />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
