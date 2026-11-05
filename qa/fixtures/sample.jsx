/** JSX must preserve the colors of embedded JavaScript. */
export function QueueCard({ label, count = 0, children }) {
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
