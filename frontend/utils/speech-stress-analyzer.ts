/**
 * Early-Warning Speech Stress Detection
 * 
 * Tracks speech patterns to detect distress before explicit threats are stated.
 * Uses browser APIs only - no ML required.
 */

export interface SpeechMetrics {
  wordsPerSecond: number;
  repeatedWords: number;
  pauseCount: number;
  averagePauseDuration: number;
  confidence: number; // 0-100, builds over time
  stressIndicators: string[];
}

export interface SpeechEvent {
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export class SpeechStressAnalyzer {
  private events: SpeechEvent[] = [];
  private wordHistory: string[] = [];
  private pauseTimestamps: number[] = [];
  private lastSpeechTime: number = 0;
  private readonly WINDOW_SIZE_MS = 30000; // 30 second analysis window
  private readonly MIN_PAUSE_MS = 1000; // 1 second = significant pause
  private readonly FAST_SPEECH_THRESHOLD = 3.5; // words per second
  private readonly SLOW_SPEECH_THRESHOLD = 1.0; // words per second
  private readonly CONFIDENCE_THRESHOLD = 60; // Trigger early warning at 60%

  /**
   * Analyze speech event and return stress metrics
   */
  analyzeEvent(text: string, isFinal: boolean): SpeechMetrics {
    const now = Date.now();
    const event: SpeechEvent = {
      text: text.trim(),
      timestamp: now,
      isFinal,
    };

    // Add to history
    this.events.push(event);
    
    // Clean old events outside window
    this.cleanOldEvents(now);

    // Extract words from current text
    const words = this.extractWords(text);
    this.wordHistory.push(...words);

    // Calculate metrics
    const wordsPerSecond = this.calculateSpeakingSpeed(now);
    const repeatedWords = this.detectRepeatedWords();
    const { pauseCount, averagePauseDuration } = this.analyzePauses(now);
    const stressIndicators = this.identifyStressIndicators(
      wordsPerSecond,
      repeatedWords,
      pauseCount,
      averagePauseDuration
    );
    const confidence = this.calculateConfidence(
      wordsPerSecond,
      repeatedWords,
      pauseCount,
      stressIndicators.length
    );

    // Update last speech time
    if (words.length > 0) {
      this.lastSpeechTime = now;
    }

    return {
      wordsPerSecond,
      repeatedWords,
      pauseCount,
      averagePauseDuration,
      confidence,
      stressIndicators,
    };
  }

  /**
   * Extract words from text, handling punctuation
   */
  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Calculate words per second in the current window
   */
  private calculateSpeakingSpeed(now: number): number {
    const windowStart = now - this.WINDOW_SIZE_MS;
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart);
    
    if (recentEvents.length === 0) return 0;

    const totalWords = recentEvents.reduce((sum, e) => {
      return sum + this.extractWords(e.text).length;
    }, 0);

    const timeSpan = Math.min(this.WINDOW_SIZE_MS, now - recentEvents[0].timestamp);
    if (timeSpan === 0) return 0;

    return (totalWords / timeSpan) * 1000; // words per second
  }

  /**
   * Detect repeated words/phrases (stress indicator)
   */
  private detectRepeatedWords(): number {
    if (this.wordHistory.length < 3) return 0;

    // Check last 20 words for immediate repetitions
    const recentWords = this.wordHistory.slice(-20);
    const wordCounts = new Map<string, number>();
    
    recentWords.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    // Count words that appear 3+ times (indicating stress/repetition)
    let repeatedCount = 0;
    wordCounts.forEach((count, word) => {
      if (count >= 3 && word.length > 2) { // Ignore short words like "a", "the"
        repeatedCount += count - 2; // Count excess repetitions
      }
    });

    return repeatedCount;
  }

  /**
   * Analyze pauses in speech
   */
  private analyzePauses(now: number): { pauseCount: number; averagePauseDuration: number } {
    const windowStart = now - this.WINDOW_SIZE_MS;
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart);
    
    if (recentEvents.length < 2) {
      return { pauseCount: 0, averagePauseDuration: 0 };
    }

    const pauses: number[] = [];
    for (let i = 1; i < recentEvents.length; i++) {
      const prevEvent = recentEvents[i - 1];
      const currEvent = recentEvents[i];
      
      const words = this.extractWords(prevEvent.text);
      if (words.length === 0) continue;

      const pauseDuration = currEvent.timestamp - prevEvent.timestamp;
      if (pauseDuration >= this.MIN_PAUSE_MS) {
        pauses.push(pauseDuration);
        this.pauseTimestamps.push(currEvent.timestamp);
      }
    }

    // Check for current pause (silence since last speech)
    if (this.lastSpeechTime > 0) {
      const currentPause = now - this.lastSpeechTime;
      if (currentPause >= this.MIN_PAUSE_MS) {
        pauses.push(currentPause);
      }
    }

    const pauseCount = pauses.length;
    const averagePauseDuration = pauseCount > 0
      ? pauses.reduce((sum, p) => sum + p, 0) / pauseCount
      : 0;

    return { pauseCount, averagePauseDuration };
  }

  /**
   * Identify specific stress indicators
   */
  private identifyStressIndicators(
    wordsPerSecond: number,
    repeatedWords: number,
    pauseCount: number,
    avgPauseDuration: number
  ): string[] {
    const indicators: string[] = [];

    // Fast speech (anxiety/stress)
    if (wordsPerSecond > this.FAST_SPEECH_THRESHOLD) {
      indicators.push(`Rapid speech (${wordsPerSecond.toFixed(1)} wps)`);
    }

    // Slow speech with pauses (distress/hesitation)
    if (wordsPerSecond < this.SLOW_SPEECH_THRESHOLD && pauseCount > 2) {
      indicators.push(`Hesitant speech with ${pauseCount} pauses`);
    }

    // Repeated words (stress/uncertainty)
    if (repeatedWords >= 3) {
      indicators.push(`${repeatedWords} word repetitions detected`);
    }

    // Long pauses followed by speech (sudden urgency)
    if (avgPauseDuration > 3000 && pauseCount > 1) {
      indicators.push(`Long pauses (avg ${(avgPauseDuration / 1000).toFixed(1)}s)`);
    }

    // Sudden volume changes (if we had audio level data)
    // This would require Web Audio API integration

    return indicators;
  }

  /**
   * Calculate confidence score (0-100) based on stress indicators
   */
  private calculateConfidence(
    wordsPerSecond: number,
    repeatedWords: number,
    pauseCount: number,
    indicatorCount: number
  ): number {
    let confidence = 0;

    // Fast speech indicator (30 points max)
    if (wordsPerSecond > this.FAST_SPEECH_THRESHOLD) {
      const excess = wordsPerSecond - this.FAST_SPEECH_THRESHOLD;
      confidence += Math.min(30, excess * 10);
    }

    // Repeated words indicator (25 points max)
    if (repeatedWords >= 3) {
      confidence += Math.min(25, repeatedWords * 5);
    }

    // Pause pattern indicator (25 points max)
    if (pauseCount > 2) {
      confidence += Math.min(25, pauseCount * 5);
    }

    // Multiple indicators boost (20 points max)
    if (indicatorCount >= 2) {
      confidence += Math.min(20, indicatorCount * 10);
    }

    // Cap at 100
    return Math.min(100, Math.round(confidence));
  }

  /**
   * Check if early warning should be triggered
   */
  shouldTriggerEarlyWarning(metrics: SpeechMetrics): boolean {
    return metrics.confidence >= this.CONFIDENCE_THRESHOLD;
  }

  /**
   * Clean old events outside the analysis window
   */
  private cleanOldEvents(now: number): void {
    const cutoff = now - this.WINDOW_SIZE_MS;
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    
    // Keep only recent words (last 50 words)
    if (this.wordHistory.length > 50) {
      this.wordHistory = this.wordHistory.slice(-50);
    }

    // Clean old pause timestamps
    this.pauseTimestamps = this.pauseTimestamps.filter(t => t >= cutoff);
  }

  /**
   * Reset analyzer (useful for new sessions)
   */
  reset(): void {
    this.events = [];
    this.wordHistory = [];
    this.pauseTimestamps = [];
    this.lastSpeechTime = 0;
  }

  /**
   * Get current metrics summary
   */
  getCurrentMetrics(): SpeechMetrics {
    const now = Date.now();
    return this.analyzeEvent('', false);
  }
}
