import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Helper to get random element
export const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

