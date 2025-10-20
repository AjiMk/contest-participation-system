export function setCookie(name: string, value: string, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/`;
}

export function getCookie(name: string): string | null {
  const target = `${encodeURIComponent(name)}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const parts = decodedCookie.split(';');
  for (let c of parts) {
    c = c.trim();
    if (c.startsWith(target)) return c.substring(target.length) || '';
  }
  return null;
}

export function deleteCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

