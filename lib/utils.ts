import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imageId: string, size = "s") {
  return "https://i.imgur.com/" + imageId + size + ".jpg";
}
