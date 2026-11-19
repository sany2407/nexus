import { Mail } from "lucide-react";

export function NexusFooter() {
  return (
    <footer className="relative z-30 flex h-9 shrink-0 items-center justify-between gap-3 border-t border-white/[0.055] bg-[#07090d]/88 px-3 backdrop-blur-xl sm:h-10 sm:px-5">
      <p className="min-w-0 truncate font-mono text-[5.8px] font-medium uppercase tracking-[0.16em] text-white/38 sm:text-[7px] sm:tracking-[0.28em]">
        ONE CONNECTED RESTAURANT ECOSYSTEM.
      </p>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
        <p className="font-mono text-[5.4px] tracking-[0.02em] text-white/28 sm:text-[6.5px]">
          Powered by <span className="text-white/60">Abielan</span>.
        </p>
        <span className="h-2.5 w-px bg-white/10" />
        <a
          href="mailto:info@abielan.in"
          className="group flex items-center gap-1 font-mono text-[5.4px] tracking-[0.02em] text-white/38 transition hover:text-brand-soft sm:gap-1.5 sm:text-[6.5px]"
        >
          <Mail
            className="h-2.5 w-2.5 text-white/25 transition group-hover:text-brand-soft/80"
            strokeWidth={1.6}
          />
          info@abielan.in
        </a>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />
    </footer>
  );
}
