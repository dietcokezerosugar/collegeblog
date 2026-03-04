import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReadingTime(content: unknown) {
  const text = typeof content === 'string' ? content : JSON.stringify(content)
  const wordsPerMinute = 200
  const noOfWords = text.split(/\s+/).length
  const minutes = noOfWords / wordsPerMinute
  return Math.ceil(minutes)
}
