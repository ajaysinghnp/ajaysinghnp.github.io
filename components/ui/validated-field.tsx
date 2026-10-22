"use client";

import { type ReactNode, type RefObject, useState } from "react";

import { AlertCircle, Check, CheckCircle2, Circle, type LucideIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ValidationRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

/** True when the value satisfies every rule; an empty optional field is always valid. */
export function isFieldValid(rules: ValidationRule[], value: string, optional = false) {
  if (optional && !value.trim()) return true;
  return rules.every((rule) => rule.test(value));
}

interface ValidatedFieldProps {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onValueChange: (value: string) => void;
  rules: ValidationRule[];
  optional?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "email";
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  /** Shows a live character counter against this limit. */
  counterMax?: number;
  /** Forces error styling, e.g. after a submit attempt. */
  showErrors?: boolean;
  /** Rendered between the label and the control, e.g. a formatting toolbar. */
  toolbar?: ReactNode;
  /** When set, replaces the textarea (which stays mounted but hidden). */
  preview?: ReactNode;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

function Counter({ length, max }: { length: number; max: number }): ReactNode {
  return (
    <span
      className={cn(
        "font-mono text-xs resume-muted tabular-nums",
        length > max && "text-rose-500",
        length > max * 0.9 && length <= max && "text-amber-500",
      )}
      aria-hidden="true"
    >
      {length} / {max}
    </span>
  );
}

export function ValidatedField({
  id,
  name,
  label,
  icon: Icon,
  value,
  onValueChange,
  rules,
  optional = false,
  multiline = false,
  rows = 5,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  counterMax,
  showErrors = false,
  toolbar,
  preview,
  textareaRef,
}: ValidatedFieldProps) {
  const [focused, setFocused] = useState(false);
  const [blurred, setBlurred] = useState(false);

  const empty = !value.trim();
  const valid = isFieldValid(rules, value, optional);
  const checked = blurred || showErrors;
  const hasError = !valid && checked;
  const hasSuccess = valid && !empty;
  const showRules = value.length > 0 || (!optional && (focused || hasError));
  const rulesId = `${id}-rules`;

  const sharedProps = {
    id,
    name,
    value,
    disabled,
    placeholder,
    autoComplete,
    "aria-invalid": hasError,
    "aria-describedby": rulesId,
    onChange: (e: { target: { value: string } }) => onValueChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      setBlurred(true);
    },
    className: cn(
      "w-full rounded-sm border bg-transparent py-2.5 pr-9 pl-9 text-sm text-(--site-text) transition outline-none placeholder:text-(--site-muted)/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--site-accent)_20%,transparent)] disabled:opacity-60",
      hasError && "border-rose-500/70 focus:border-rose-500",
      !hasError && hasSuccess && "border-emerald-500/50 focus:border-emerald-500",
      !hasError && !hasSuccess && "border-(--site-surface-border) focus:border-(--site-accent)",
    ),
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="section-code">
          {label}
        </label>
        <span className="text-xs resume-muted">{optional ? "optional" : "required"}</span>
      </div>

      {toolbar && <div className="mt-2">{toolbar}</div>}

      <div className="relative mt-2">
        <Icon
          className={cn(
            "pointer-events-none absolute left-3 h-4 w-4 transition-colors",
            multiline ? "top-3" : "top-1/2 -translate-y-1/2",
            focused ? "site-nav-active" : "resume-muted",
          )}
          aria-hidden="true"
        />
        {multiline ? (
          <textarea
            {...sharedProps}
            ref={textareaRef}
            rows={rows}
            className={cn(sharedProps.className, "resize-y", preview !== undefined && "hidden")}
          />
        ) : (
          <input {...sharedProps} type={type} />
        )}
        {preview}
        <span
          className={cn(
            "pointer-events-none absolute right-3",
            multiline ? "top-3" : "top-1/2 -translate-y-1/2",
          )}
          aria-hidden="true"
        >
          {hasError && <AlertCircle className="h-4 w-4 text-rose-500" />}
          {!hasError && hasSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        </span>
      </div>

      <div
        id={rulesId}
        aria-live="polite"
        className={cn(
          "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          showRules ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 pt-2">
            <ul className="space-y-1 text-xs">
              {rules.map((rule) => {
                const met = rule.test(value);
                const failed = !met && hasError;
                return (
                  <li
                    key={rule.id}
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      met && "text-emerald-500",
                      failed && "text-rose-500",
                      !met && !failed && "resume-muted",
                    )}
                  >
                    {met && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    {failed && <X className="h-3.5 w-3.5" aria-hidden="true" />}
                    {!met && !failed && <Circle className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{rule.label}</span>
                    <span className="sr-only">{met ? "met" : "not met"}</span>
                  </li>
                );
              })}
            </ul>
            {counterMax !== undefined && <Counter length={value.length} max={counterMax} />}
          </div>
        </div>
      </div>

      {!showRules && counterMax !== undefined && (
        <div className="mt-1.5 flex justify-end">
          <Counter length={value.length} max={counterMax} />
        </div>
      )}
    </div>
  );
}
