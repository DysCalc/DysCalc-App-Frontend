import { useEffect, ReactNode } from "react";

export type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "danger";
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

export default function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  maxWidth = "sm",
}: AlertModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  const getPrimaryButtonClasses = (
    variant?: "primary" | "danger"
  ) => {
    if (variant === "danger") {
      return "bg-red-600 hover:bg-red-700 text-white";
    }
    // Default primary green color used in the app
    return "bg-[#29A177] hover:bg-[#018255] text-white";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-opacity"
      onMouseDown={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>

        {description && (
          <div className="mb-6 text-base text-gray-600">{description}</div>
        )}

        {children && <div className="mb-6">{children}</div>}

        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className="rounded-lg border border-[#D9D9D9] px-4 py-2 text-sm font-medium text-[#6C6C6C] transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getPrimaryButtonClasses(
                  primaryAction.variant
                )}`}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
