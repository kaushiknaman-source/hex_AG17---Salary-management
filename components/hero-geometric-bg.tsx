export function HeroGeometricBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-hex-dot opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <svg
        className="absolute -right-24 -top-24 h-[560px] w-[560px] animate-float opacity-[0.14]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M35 6 L11 32 L35 88 L35 46 L11 32"
          stroke="#01ADFF"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M35 46 L79 26 L79 64 L35 88 L79 64"
          stroke="#005198"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="absolute -left-16 top-1/3 h-[320px] w-[320px] opacity-[0.09]"
        style={{ animation: "float 11s ease-in-out infinite", animationDelay: "1.5s" }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M35 6 L11 32 L35 88 L35 46 L11 32"
          stroke="#99D6FF"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M35 46 L79 26 L79 64 L35 88 L79 64"
          stroke="#01ADFF"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
