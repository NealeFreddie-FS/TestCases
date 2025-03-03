import { GameEngine } from "../GameEngine";

export class PerformanceManager {
  private engine: GameEngine;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private currentFps: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every 1 second
  private frameTimeAccumulator: number = 0;
  private currentFrameTime: number = 0;
  private frameTimeSamples: number[] = [];
  private maxSamples: number = 60; // Store 60 samples for averaging

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.lastTime = performance.now();
  }

  /**
   * Update performance metrics
   * @param timestamp Current timestamp
   */
  update(timestamp: number = performance.now()): void {
    // Calculate time since last frame
    const deltaTime = timestamp - this.lastTime;
    this.frameCount++;
    this.frameTimeAccumulator += deltaTime;

    // Store frame time for averaging (excluding first frame which can be an outlier)
    if (this.frameCount > 1) {
      this.currentFrameTime = deltaTime;
      this.frameTimeSamples.push(deltaTime);

      // Keep only the most recent samples
      if (this.frameTimeSamples.length > this.maxSamples) {
        this.frameTimeSamples.shift();
      }
    }

    // Update FPS every fpsUpdateInterval milliseconds
    if (this.frameTimeAccumulator >= this.fpsUpdateInterval) {
      this.currentFps = Math.round(
        (this.frameCount * 1000) / this.frameTimeAccumulator
      );

      // Log performance data for debugging
      if (this.currentFps < 45) {
        console.log(`Low FPS detected: ${this.currentFps}`);
        console.log(
          `Average frame time: ${this.getAverageFrameTime().toFixed(2)}ms`
        );
      }

      this.frameCount = 0;
      this.frameTimeAccumulator = 0;
    }

    this.lastTime = timestamp;
  }

  /**
   * Get the current FPS
   */
  getFps(): number {
    return this.currentFps;
  }

  /**
   * Get average frame time in milliseconds
   */
  getAverageFrameTime(): number {
    if (this.frameTimeSamples.length === 0) return 0;

    const sum = this.frameTimeSamples.reduce((acc, val) => acc + val, 0);
    return sum / this.frameTimeSamples.length;
  }

  /**
   * Get the most recent frame time
   */
  getCurrentFrameTime(): number {
    return this.currentFrameTime;
  }
}
