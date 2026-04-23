import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Generate a random 6-digit numeric token */
export function generateToken(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/** Generate N unique tokens */
export function generateTokens(count: number): string[] {
  const tokens = new Set<string>()
  while (tokens.size < count) {
    tokens.add(generateToken())
  }
  return Array.from(tokens)
}
