import { useEffect, useRef, useState, type ReactNode } from "react";

/** Scroll-triggered reveal with optional stagger delay. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** Animated flight-path arcs with travelling light pulses. */
export function FlightLines({ className = "" }: { className?: string }) {
  const arcs = [
    { d: "M40,320 C220,120 520,120 700,250", dur: "6s", delay: "0s" },
    { d: "M20,180 C260,320 560,340 780,180", dur: "7.5s", delay: "1.2s" },
    { d: "M120,420 C320,300 600,420 760,330", dur: "8.5s", delay: "2.4s" },
    { d: "M0,80 C240,40 520,220 800,90", dur: "9.5s", delay: "0.6s" },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 800 460"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="arc-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {arcs.map((arc) => (
        <g key={arc.d} className="text-sunset">
          <path
            d={arc.d}
            stroke="url(#arc-stroke)"
            strokeWidth="1.5"
            className="arc-path"
            style={{ animationDelay: arc.delay }}
          />
          <circle r="4" className="fill-brand arc-dot">
            <animateMotion
              dur={arc.dur}
              begin={arc.delay}
              repeatCount="indefinite"
              path={arc.d}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/** Counts up to a value when scrolled into view. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Start at the target value so SSR and non-JS clients see the real number.
  // The animation resets to 0 only on the client after hydration.
  const [value, setValue] = useState(to);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setValue(0);
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(to * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Infinite horizontal ticker. */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden py-4">
      <div className="animate-marquee flex w-max items-center gap-10">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 font-mono text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap"
          >
            {item}
            <span className="size-1 rounded-full bg-sunset/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Subtle 3D tilt + parallax following the pointer. */
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-6px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-500 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
