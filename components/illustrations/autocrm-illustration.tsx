export function AutoCRMIllustration() {
  return (
    <svg
      role="img"
      aria-label="AutoCRM dashboard illustration"
      viewBox="0 0 720 500"
      className="absolute inset-0 size-full"
    >
      <title>
        Geometric AutoCRM dashboard with a sidebar, four stat blocks, pipeline
        chart, and follow-up panel
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
        <rect
          x="48"
          y="68"
          width="120"
          height="360"
          className="fill-brand-700"
        />
        <path
          d="M168 68V428M48 120H672"
          className="stroke-brand-500"
          strokeWidth="1.5"
        />
        <text
          x="64"
          y="101"
          fontSize="20"
          fontWeight="500"
          letterSpacing="-0.5"
          className="fill-brand-100"
        >
          AutoCRM
        </text>
        <text x="184" y="101" fontSize="17" className="fill-brand-100">
          Insights
        </text>
        <path
          d="M487 88H594M487 98H551"
          className="stroke-brand-600"
          strokeWidth="3"
        />
        <circle cx="638" cy="94" r="10" className="fill-action" />
        <rect
          x="60"
          y="144"
          width="96"
          height="28"
          className="fill-brand-300"
        />
        <g className="fill-brand-900">
          <rect x="69" y="152" width="5" height="5" />
          <rect x="77" y="152" width="5" height="5" />
          <rect x="69" y="160" width="5" height="5" />
          <rect x="77" y="160" width="5" height="5" />
        </g>
        <path d="M92 158H145" className="stroke-brand-900" strokeWidth="4" />
        {[194, 227, 260, 293].map((y) => (
          <g key={y}>
            <rect
              x="69"
              y={y - 5}
              width="10"
              height="10"
              fill="none"
              className="stroke-brand-300"
            />
            <path
              d={`M92 ${y}H143`}
              className="stroke-brand-400"
              strokeWidth="4"
            />
          </g>
        ))}
        <circle cx="76" cy="395" r="10" className="fill-brand-300" />
        <path d="M95 395H143" className="stroke-brand-400" strokeWidth="4" />
        {[184, 304, 424, 544].map((x) => (
          <g key={x}>
            <rect
              x={x}
              y="136"
              width="108"
              height="60"
              className="fill-brand-700 stroke-brand-600"
            />
            <circle cx={x + 15} cy="151" r="4" className="fill-brand-300" />
            <path
              d={`M${x + 14} 174H${x + 56}`}
              className="stroke-brand-100"
              strokeWidth="8"
            />
            <path
              d={`M${x + 65} 174H${x + 92}`}
              className="stroke-brand-500"
              strokeWidth="3"
            />
          </g>
        ))}
        <rect
          x="184"
          y="212"
          width="284"
          height="200"
          className="fill-brand-700 stroke-brand-600"
        />
        <text x="199" y="238" fontSize="14" className="fill-brand-100">
          Pipeline
        </text>
        {[265, 300, 335, 378].map((y) => (
          <path
            key={y}
            d={`M200 ${y}H451`}
            className="stroke-brand-600"
            strokeWidth="0.75"
          />
        ))}
        <rect
          x="220"
          y="336"
          width="44"
          height="42"
          className="fill-brand-500"
        />
        <rect
          x="287"
          y="307"
          width="44"
          height="71"
          className="fill-brand-300"
        />
        <rect x="354" y="265" width="44" height="113" className="fill-action" />
        <path
          d="M220 394H254M287 394H321M354 394H388"
          className="stroke-brand-400"
          strokeWidth="3"
        />
        <rect
          x="484"
          y="212"
          width="168"
          height="200"
          className="fill-brand-700 stroke-brand-600"
        />
        <text x="499" y="238" fontSize="14" className="fill-brand-100">
          Today’s focus
        </text>
        {[500, 548, 596].map((x) => (
          <rect
            key={x}
            x={x}
            y="254"
            width="40"
            height="24"
            className="fill-brand-600"
          />
        ))}
        <circle
          cx="523"
          cy="312"
          r="17"
          fill="none"
          className="stroke-brand-300"
          strokeWidth="2"
        />
        <path
          d="M515 312L521 318L532 306"
          fill="none"
          className="stroke-brand-300"
          strokeWidth="2"
        />
        <path
          d="M499 344H627M499 355H586"
          className="stroke-brand-400"
          strokeWidth="3"
        />
        <rect x="499" y="373" width="138" height="25" className="fill-action" />
        <path
          d="M511 385H572M608 380L613 385L608 390M601 385H613"
          fill="none"
          className="stroke-brand-900"
          strokeWidth="2"
        />
      </g>
      <text
        x="48"
        y="468"
        fontFamily="var(--font-mono), monospace"
        fontSize="10"
        letterSpacing="2"
        className="fill-brand-300"
      >
        02 / PIPELINES &amp; FOLLOW-UPS
      </text>
    </svg>
  )
}
