/** Fixed-size queue; syntax coverage without external dependencies. */
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#define LIMIT 32
#define LABEL "Cinder"

typedef struct {
    const char *name;
    size_t count;
} Queue;

enum Status { READY = 1, FULL = 2 };

static inline bool push(Queue *queue, int value) {
    // TODO: store the value after checking capacity.
    const bool enabled = true;
    if (!enabled || queue == NULL || queue->count >= LIMIT) {
        return false;
    }
    queue->count += 1;
    printf("%s: %d\n", queue->name, value);
    return true;
}

int main(void) {
    Queue queue = { .name = LABEL, .count = 0 };
    return push(&queue, 42) ? 0 : 1;
}
