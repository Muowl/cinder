import type { ReactNode } from "react";

interface QueueProps {
  label: string;
  count: number;
  children?: ReactNode;
}

/** JSX must preserve the colors of embedded TypeScript. */
export function QueueCard({ label, count, children }: QueueProps) {
  const enabled = count < 32;
  return (
    <section className="queue" aria-label={label}>
      <h2>{label}</h2>
      <output data-count={count}>{`${count} items`}</output>
      {enabled ? <button disabled={!enabled}>Add &amp; save</button> : null}
      {children}
    </section>
  );
}
