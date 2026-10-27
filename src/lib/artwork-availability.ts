export function canEnquire(status: string | null | undefined): boolean {
  return status !== "sold" && status !== "private";
}

export function isSold(status: string | null | undefined): boolean {
  return status === "sold";
}