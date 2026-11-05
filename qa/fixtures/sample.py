"""Bounded queue used for Python syntax coverage."""
from dataclasses import dataclass, field
from typing import Generic, TypeVar

T = TypeVar("T")
LIMIT: int = 32

@dataclass
class Queue(Generic[T]):
    label: str
    items: list[T] = field(default_factory=list)

    @property
    def count(self) -> int:
        """Expose the current queue length."""
        return len(self.items)

    async def push(self, value: T) -> bool:
        # TODO: persist the item after validation.
        enabled: bool = True
        if not enabled or self.count >= LIMIT:
            return False
        self.items.append(value)
        print(f"{self.label}: {self.count:02d}\n")
        return value is not None

def names(entries: list[Queue[str]]) -> list[str]:
    pattern = r"^queue\s+\d+$"
    return [entry.label for entry in entries if entry.count > 0]
