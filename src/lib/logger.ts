/**
 * Centralized logging utility for Scan Chan
 * Respects NODE_ENV and provides consistent logging interface
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const isDev = process.env.NODE_ENV === "development"

class Logger {
  private prefix = "[Scan Chan]"

  debug(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.debug(`${this.prefix} 🔍`, message, ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.info(`${this.prefix} ℹ️`, message, ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.prefix} ⚠️`, message, ...args)
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    console.error(`${this.prefix} ❌`, message, error, ...args)
  }

  scanner(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.log(`${this.prefix} 📷`, message, ...args)
    }
  }

  pet(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.log(`${this.prefix} 🐱`, message, ...args)
    }
  }

  game(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.log(`${this.prefix} 🎮`, message, ...args)
    }
  }
}

export const logger = new Logger()
