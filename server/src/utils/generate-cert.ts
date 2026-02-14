import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CERTS_DIR = path.join(process.cwd(), "certs");
const KEY_PATH = path.join(CERTS_DIR, "server.key");
const CERT_PATH = path.join(CERTS_DIR, "server.crt");

/**
 * Find the openssl binary. On Windows it's often bundled with Git.
 */
function findOpenSSL(): string {
  // Try PATH first
  try {
    execSync("openssl version", { stdio: "pipe" });
    return "openssl";
  } catch {
    // ignore
  }

  // Common Windows locations (Git for Windows bundles openssl)
  const candidates = [
    "C:\\Program Files\\Git\\usr\\bin\\openssl.exe",
    "C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe",
    "C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe",
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `"${candidate}"`;
    }
  }

  throw new Error("OpenSSL not found");
}

/**
 * Generates a self-signed SSL certificate for development.
 * Uses Node.js built-in crypto if available (Node 15+),
 * otherwise falls back to openssl CLI.
 *
 * Certs are stored in ./certs/ and reused across restarts.
 */
export function ensureSelfSignedCert(): { keyPath: string; certPath: string } {
  // If certs already exist, reuse them
  if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
    return { keyPath: KEY_PATH, certPath: CERT_PATH };
  }

  // Create certs directory
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }

  console.log("🔑 Generating self-signed SSL certificate...");

  try {
    generateWithOpenSSL();
  } catch (e: any) {
    console.error("❌ Failed to generate SSL certificate:", e.message);
    console.error(
      "   Please either:\n" +
        "   1. Install OpenSSL (or Git for Windows which includes it), or\n" +
        "   2. Provide SSL_KEY_PATH and SSL_CERT_PATH in .env, or\n" +
        "   3. Set HTTPS_ENABLED=false in .env to use HTTP\n",
    );
    process.exit(1);
  }

  console.log(`🔑 Certificate saved to ${CERTS_DIR}`);
  return { keyPath: KEY_PATH, certPath: CERT_PATH };
}

function generateWithOpenSSL(): void {
  const openssl = findOpenSSL();
  const subject = "/C=UZ/ST=Dev/L=Dev/O=Qurilish/CN=localhost";

  execSync(
    `${openssl} req -x509 -newkey rsa:2048 -keyout "${KEY_PATH}" -out "${CERT_PATH}" ` +
      `-days 365 -nodes -subj "${subject}" ` +
      `-addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.77.7,IP:0.0.0.0"`,
    { stdio: "pipe" },
  );
}
