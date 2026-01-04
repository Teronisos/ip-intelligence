// ValidateIP.tsx

export type IPVersion = "ipv4" | "ipv6";

export type IPValidationResult = {
  valid: boolean;
  version?: IPVersion;
};

function isIPv4(ip: string): boolean {
  return /^[0-9.]+$/.test(ip) && ip.split(".").length === 4;
}

function isPublicIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(n => n < 0 || n > 255)) return false;

  const [a, b] = parts;

  if (a === 0) return false;
  if (a === 10) return false;
  if (a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a >= 224) return false;

  return true;
}

function isPublicIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === "::" || normalized === "::1") return false;
  if (normalized.startsWith("ff")) return false;
  if (normalized.startsWith("fe80")) return false;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return false;
  if (normalized.startsWith("::ffff:")) return false;

  try {
    new URL(`http://[${ip}]`);
    return true;
  } catch {
    return false;
  }
}

function ValidateIP(input: string): IPValidationResult {
  if (isIPv4(input)) {
    return isPublicIPv4(input)
      ? { valid: true, version: "ipv4" }
      : { valid: false };
  }

  return isPublicIPv6(input)
    ? { valid: true, version: "ipv6" }
    : { valid: false };
}

export default ValidateIP;