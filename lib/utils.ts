import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  })
    .format(price)
    .replace("₩", "") + "원";
}

export function getSourceName(source: string): string {
  const names: Record<string, string> = {
    danggeun: "당근마켓",
    bunjang: "번개장터",
    junggonara: "중고나라",
    coupang: "쿠팡"
  };
  return names[source] || source;
}

export function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    danggeun: "#FF6F0F",
    bunjang: "#FF6B6B", 
    junggonara: "#51C878",
    coupang: "#0074E4"
  };
  return colors[source] || "#4A90E2";
}