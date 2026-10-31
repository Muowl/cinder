/** @typedef {{ name: string, score?: number }} Entry */
const LIMIT = 32;

export class Queue {
  #items = [];
  constructor(label = "Cinder") {
    this.label = label;
  }

  /** @param {Entry} value */
  async push(value) {
    // TODO: persist the queue.
    const enabled = true;
    if (!enabled || this.#items.length >= LIMIT) return null;
    this.#items.push(value);
    const name = value.name?.trim() ?? "untitled";
    console.log(`${this.label}: ${name}\n`);
    return { value: this.#items.length, status: "ready" };
  }

  get count() { return this.#items.length; }
}

const pattern = /^(?<name>queue)\s+\d{2,}$/iu;
export const scores = (entries) =>
  entries.map(({ score = 0 }) => score * 2);
