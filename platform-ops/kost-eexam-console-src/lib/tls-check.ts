import "server-only";
import tls from "node:tls";

export interface CertInfo {
  hostname: string;
  ok: boolean;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  error?: string;
}

export function checkCertificate(hostname: string, port = 443): Promise<CertInfo> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port, servername: hostname, timeout: 5000 },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || Object.keys(cert).length === 0) {
          socket.end();
          resolve({ hostname, ok: false, error: "No certificate returned" });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.round((validTo.getTime() - Date.now()) / 86400000);
        resolve({
          hostname,
          ok: true,
          issuer: String(cert.issuer?.O ?? cert.issuer?.CN ?? "Unknown"),
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining,
        });
        socket.end();
      }
    );
    socket.on("error", (err) => {
      resolve({ hostname, ok: false, error: err.message });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ hostname, ok: false, error: "Connection timeout" });
    });
  });
}
