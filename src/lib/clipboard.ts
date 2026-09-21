// Resolves false instead of throwing when the browser refuses (for example,
// permission denied); callers point the user at the address bar instead.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
