/** A bounded queue with immutable configuration. */
export interface Entry {
  readonly name: string;
  score?: number;
}

export enum Status { Ready, Full }
export type Result<T> = { value: T; status: Status };
const LIMIT = 32;

export class Queue<T extends Entry> {
  private readonly items: T[] = [];
  constructor(public readonly label: string) {}

  async push(value: T): Promise<Result<number> | null> {
    // TODO: persist the queue.
    const enabled: boolean = true;
    if (!enabled || this.items.length >= LIMIT) return null;
    this.items.push(value);
    const name = value.name?.trim() ?? "untitled";
    console.log(`${this.label}: ${name}\n`);
    return { value: this.items.length, status: Status.Ready };
  }
}

const pattern = /^(?<name>queue)\s+\d{2,}$/iu;
export const scores = (entries: Entry[]) =>
  entries.map(({ score = 0 }) => score * 2);
