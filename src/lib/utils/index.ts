import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Helper to get random element
export const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const currencySigns: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
};

export const getCurrencySign = (code: string) =>
    currencySigns[code.toUpperCase()] || code;