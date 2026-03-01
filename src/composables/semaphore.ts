export class Semaphore {
  private queue: (() => void)[] = []
  private active = 0

  constructor(private concurrency: number) {}

  async acquire(): Promise<void> {
    if (this.active < this.concurrency) {
      this.active++
      return
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
    })
  }

  release(): void {
    const next = this.queue.shift()
    if (next) {
      next()
    } else {
      this.active--
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }
}
