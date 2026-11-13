const products = [
  { x: 184, surface: "fill-brand-700", label: "circle" },
  { x: 344, surface: "fill-brand-600", label: "square" },
  { x: 504, surface: "fill-brand-500", label: "stripe" },
]

export function WineAdoreIllustration() {
  return (
    <svg
      role="img"
      aria-label="WineAdore storefront illustration"
      viewBox="0 0 720 500"
      className="absolute inset-0 size-full"
    >
      <title>
        Geometric WineAdore storefront with a filter sidebar, discovery banner,
        and three bottle cards
      </title>
      <rect width="720" height="500" className="fill-brand-900" />
      <circle cx="690" cy="480" r="112" className="fill-brand-700" />
      <g className="transition-transform duration-500 motion-safe:group-hover:-translate-y-1">
        <rect
          x="48"
          y="68"
          width="624"
          height="360"
          className="fill-brand-800 stroke-brand-500"
          strokeWidth="1.5"
        />
        <path d="M48 120H672" className="stroke-brand-500" strokeWidth="1.5" />
        <circle cx="78" cy="94" r="9" className="fill-brand-100" />
        <text
          x="100"
          y="101"
          fontSize="23"
          fontWeight="500"
          letterSpacing="-0.6"
          className="fill-brand-100"
        >
          WineAdore
        </text>
        <path
          d="M557 91H607M557 98H589"
          className="stroke-brand-400"
          strokeWidth="3"
        />
        <path
          d="M636 88H648L650 104H634ZM639 88V84H645V88"
          fill="none"
          className="stroke-brand-100"
          strokeWidth="1.5"
        />
        <rect
          x="48"
          y="120"
          width="120"
          height="308"
          className="fill-brand-700"
        />
        <path d="M168 120V428" className="stroke-brand-500" strokeWidth="1.5" />
        <text x="64" y="152" fontSize="13" className="fill-brand-100">
          Filters
        </text>
        {[180, 211, 242].map((y) => (
          <g key={y}>
            <rect
              x="64"
              y={y}
              width="13"
              height="13"
              fill="none"
              className="stroke-brand-500"
            />
            <path
              d={`M88 ${y + 6}H148`}
              className="stroke-brand-400"
              strokeWidth="5"
            />
          </g>
        ))}
        <path d="M64 296H148" className="stroke-brand-600" strokeWidth="3" />
        <path d="M78 296H129" className="stroke-brand-100" strokeWidth="3" />
        <circle cx="78" cy="296" r="5" className="fill-brand-100" />
        <circle cx="129" cy="296" r="5" className="fill-brand-100" />
        <path
          d="M64 333H120M64 353H144M64 373H103"
          className="stroke-brand-600"
          strokeWidth="5"
        />
        <rect
          x="184"
          y="136"
          width="464"
          height="52"
          className="fill-brand-700"
        />
        <text x="201" y="168" fontSize="18" className="fill-brand-100">
          Find your next bottle.
        </text>
        <circle cx="622" cy="162" r="13" className="fill-action" />
        <path
          d="M617 167L627 157M617 157H627V167"
          fill="none"
          className="stroke-brand-900"
          strokeWidth="1.5"
        />
        {products.map(({ x, surface, label }) => (
          <g key={x}>
            <rect
              x={x}
              y="204"
              width="144"
              height="208"
              className="fill-brand-800 stroke-brand-600"
            />
            <rect x={x} y="204" width="144" height="154" className={surface} />
            <rect
              x={x + 51}
              y="251"
              width="42"
              height="88"
              rx="6"
              className="fill-brand-300"
            />
            <rect
              x={x + 65}
              y="226"
              width="14"
              height="29"
              className="fill-brand-300"
            />
            <rect
              x={x + 65}
              y="224"
              width="14"
              height="8"
              className="fill-brand-500"
            />
            {label === "circle" ? (
              <circle cx={x + 72} cy="291" r="13" className="fill-brand-700" />
            ) : label === "square" ? (
              <rect
                x={x + 60}
                y="279"
                width="24"
                height="24"
                className="fill-action"
              />
            ) : (
              <path
                d={`M${x + 51} 280H${x + 93}V299H${x + 51}Z`}
                className="fill-brand-700"
              />
            )}
            <path
              d={`M${x + 15} 379H${x + 108}`}
              className="stroke-brand-100"
              strokeWidth="6"
            />
            <path
              d={`M${x + 15} 397H${x + 69}`}
              className="stroke-brand-600"
              strokeWidth="4"
            />
          </g>
        ))}
      </g>
      <text
        x="48"
        y="468"
        fontFamily="var(--font-mono), monospace"
        fontSize="10"
        letterSpacing="2"
        className="fill-brand-300"
      >
        01 / DISCOVERY &amp; COMMERCE
      </text>
    </svg>
  )
}
