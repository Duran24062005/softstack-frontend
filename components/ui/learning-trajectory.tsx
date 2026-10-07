type LearningTrajectoryProps = {
  progress?: number;
  animated?: boolean;
  className?: string;
};

export function LearningTrajectory({
  progress = 68,
  animated = false,
  className = "",
}: LearningTrajectoryProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <svg
      viewBox="0 0 620 420"
      aria-hidden="true"
      className={`learning-trajectory ${animated ? "learning-trajectory-animated" : ""} ${className}`}
    >
      <path
        d="M42 352 L210 278 L350 286 Q472 292 494 184 Q510 104 568 70"
        pathLength="100"
        className="trajectory-base"
      />
      <path
        d="M42 352 L210 278 L350 286 Q472 292 494 184 Q510 104 568 70"
        pathLength="100"
        strokeDasharray={`${safeProgress} 100`}
        className="trajectory-progress"
      />
      <circle cx="42" cy="352" r="9" className="trajectory-start" />
      <circle cx="210" cy="278" r="7" className="trajectory-stop" />
      <circle cx="350" cy="286" r="7" className="trajectory-stop" />
      <circle cx="568" cy="70" r="20" className="trajectory-milestone" />
      <circle cx="568" cy="70" r="34" className="trajectory-milestone-ring" />
      <path d="M493 182 L535 141" className="trajectory-signal" />
      <path d="M520 161 L568 116" className="trajectory-signal trajectory-signal-secondary" />
    </svg>
  );
}
