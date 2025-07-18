import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  state: 'started' | 'completed';
  onClick?: () => void;
}

export function Tag({ children, state, onClick, ...rest }: TagProps) {
  const base =
    "inline-flex select-none rounded-full px-3 py-1 text-sm cursor-pointer transition-colors";
  const started =
    "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 shadow-sm";
  const completed =
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary-300 shadow";
  return (
    <div
      className={
        base +
        " " +
        (state === "started" ? started : completed)
      }
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
}
