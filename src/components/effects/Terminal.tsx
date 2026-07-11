import type { ElementType, ReactNode } from "react";
import clsx from "clsx";
import { ScreenTear } from "@/components/effects/GlitchEffects";

type GlitchTextProps = {
  children: string;
  as?: ElementType;
  className?: string;
  intense?: boolean;
};

export function GlitchText({
  children,
  as: Tag = "span",
  className,
  intense = false,
}: GlitchTextProps) {
  return (
    <Tag
      className={clsx(intense ? "glitch-text-intense" : "glitch-text", className)}
      data-text={children}
    >
      {children}
    </Tag>
  );
}

type TerminalFrameProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function TerminalFrame({ title, children, className }: TerminalFrameProps) {
  return (
    <div className={clsx("terminal-frame glitch-hover-frame", className)}>
      <div className="terminal-titlebar">
        <span className="terminal-dots">● ● ●</span>
        <GlitchText as="span" className="text-dim">
          {title}
        </GlitchText>
      </div>
      <div className="terminal-body">{children}</div>
    </div>
  );
}

export function ScanlinesOverlay() {
  return (
    <>
      <div className="crt-overlay" aria-hidden />
      <div className="crt-flicker" aria-hidden />
      <div className="crt-phosphor" aria-hidden />
      <ScreenTear />
    </>
  );
}

export function AsciiLogo() {
  return (
    <pre className="ascii-logo mb-4 hidden text-[5px] leading-none text-terminal sm:block sm:text-[7px] lg:text-[9px]">
{`
   ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ 
  █ ▄▄▄ █ █ ▄▄▄ █ █ ▄▄▄ █ █ ▄▄▄ █ 
  █ ███ █ █ ███ █ █ ███ █ █ ███ █ 
  █▄▄▄▄▄█ █▄▄▄▄▄█ █▄▄▄▄▄█ █▄▄▄▄▄█ 
  ▄▄▄▄▄ ▄ ▄ ▄▄▄ ▄ ▄ ▄▄▄ ▄ ▄ ▄▄▄ ▄ 
    ∞ P O N Z I . G L I T C H ∞   
  >> ATTENTION_FI :: CHAIN[4663]    
  >> [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] CORRUPTED   
`}
    </pre>
  );
}
