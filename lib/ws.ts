// lib/ws.ts
let mailSocket: WebSocket | null = null;

export function getMailSocket(base: string) {
  // Varsa var olanı kullan
  if (
    mailSocket &&
    (mailSocket.readyState === WebSocket.OPEN ||
      mailSocket.readyState === WebSocket.CONNECTING)
  ) {
    return mailSocket;
  }
  mailSocket = new WebSocket(`${base.replace(/\/$/, "")}/ws/mail`);

  // Dev-HMR sırasında sızıntıyı görselleştirmek için (opsiyonel)
  if (typeof window !== "undefined") (window as any).__MAIL_WS__ = mailSocket;

  return mailSocket;
}
