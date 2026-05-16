import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { clsx } from 'clsx';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  active?: boolean;
};

export function IconButton({ label, children, active = false, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex size-9 items-center justify-center rounded-md border text-sm transition',
        active ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
