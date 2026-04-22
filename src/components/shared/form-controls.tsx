import { ChangeEventHandler, useId } from "react";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  helperText?: string;
};

export function Field({
  label,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  disabled,
  helperText,
}: FieldProps) {
  const fieldId = useId();
  const helperId = helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={fieldId} className="text-sm font-medium text-charcoal">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={helperId}
        className="transition-soft focus-ring w-full rounded-[1.25rem] border border-soft-border bg-white/80 px-4 py-3.5 text-sm text-charcoal placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-70"
      />
      {helperText ? (
        <span id={helperId} className="text-xs text-muted">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

type TextareaFieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
};

export function TextareaField({
  label,
  name,
  value,
  placeholder,
  onChange,
  disabled,
}: TextareaFieldProps) {
  const fieldId = useId();

  return (
    <div className="grid gap-2">
      <label htmlFor={fieldId} className="text-sm font-medium text-charcoal">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={5}
        className="transition-soft focus-ring min-h-32 w-full rounded-[1.25rem] border border-soft-border bg-white/80 px-4 py-3.5 text-sm text-charcoal placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
};

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-3 rounded-[1.25rem] border border-soft-border bg-white/70 px-4 py-3 text-sm text-charcoal">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-soft-border accent-rose"
      />
      <span>{label}</span>
    </label>
  );
}

type InlineNoticeProps = {
  tone: "default" | "error" | "success";
  children: React.ReactNode;
};

export function InlineNotice({ tone, children }: InlineNoticeProps) {
  const styles =
    tone === "error"
      ? "border-rose/30 bg-rose/10 text-rose"
      : tone === "success"
        ? "border-sage/30 bg-sage/10 text-charcoal"
        : "border-gold/30 bg-gold/10 text-charcoal";

  return <div className={`rounded-[1.25rem] border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  pending: boolean;
};

export function SubmitButton({
  label,
  pendingLabel = "Please wait...",
  pending,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="transition-soft rounded-full bg-charcoal px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(31,26,23,0.18)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
