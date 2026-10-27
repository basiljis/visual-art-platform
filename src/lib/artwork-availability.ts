export function canEnquire(status: string | null | undefined): boolean {
  return status !== "sold" && status !== "private";
}

export function isSold(status: string | null | undefined): boolean {
  return status === "sold";
}
/** Red exhibition dot: shown for sold works and works in private collections. */
export function hasRedDot(status: string | null | undefined): boolean {
  return status === "sold" || status === "private";
}
