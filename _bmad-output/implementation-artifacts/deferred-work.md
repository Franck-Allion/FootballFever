## Deferred from: code review of 8-1-batch-simulator-tool.md (2026-05-03)

- Zod validation performance overhead: The match engine performs Zod validation on every tick, which becomes a bottleneck in large batch simulations. This is an engine-level architecture pattern.
- Synchronous large batch UI blocking: Large batches run synchronously, which could block the main thread. Asynchronous execution or chunking was not in scope for this pure logic story.
