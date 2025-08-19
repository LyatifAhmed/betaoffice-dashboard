// hooks/useMailNotifications.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Counts = { unread: number; urgent: number };

const backend = (p: string) => `/api/backend${p}`;

export function useMailNotifications(externalId?: string | null) {
  const [counts, setCounts] = useState<Counts>({ unread: 0, urgent: 0 });
  const [lastEvent, setLastEvent] = useState<string>("");
  const [lastUrgent, setLastUrgent] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<number | null>(null);
  const retriesRef = useRef(0);

  const wsUrl = useMemo(() => {
    if (!externalId || typeof window === "undefined") return null;
    const proto = location.protocol === "https:" ? "wss" : "ws";
    // include external_id as query param; server can auth by cookie too
    return `${proto}://${location.host}/ws/mail?external_id=${encodeURIComponent(externalId)}`;
  }, [externalId]);

  const loadCounts = async () => {
    if (!externalId) return;
    try {
      const r = await fetch(backend(`/mail/unread-count?external_id=${encodeURIComponent(externalId)}`), {
        cache: "no-store",
        credentials: "include",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      setCounts({
        unread: Number(d?.unread || 0),
        urgent: Number(d?.urgent || 0),
      });
    } catch {
      // swallow; polling will try again
    }
  };

  // Setup WS with fallback polling
  useEffect(() => {
    if (!wsUrl) {
      // ensure we still poll if no WS URL
      if (pollRef.current) window.clearInterval(pollRef.current);
      loadCounts();
      pollRef.current = window.setInterval(loadCounts, 20000);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }

    const connect = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);
      } // inside useEffect connect()
        catch {
        // fallback: start polling if WS fails
        if (pollRef.current) window.clearInterval(pollRef.current);
        loadCounts();
        pollRef.current = window.setInterval(loadCounts, 20000);
        return;
        }


      wsRef.current.onopen = () => {
        retriesRef.current = 0;
        // ask server for snapshot
        wsRef.current?.send(JSON.stringify({ type: "hello" }));
      };

      wsRef.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg?.type === "snapshot" && msg?.data) {
            setCounts({
              unread: Number(msg.data.unread || 0),
              urgent: Number(msg.data.urgent || 0),
            });
          } else if (msg?.type === "mail:new") {
            setCounts((c) => ({ ...c, unread: Math.max(0, (c.unread ?? 0) + 1) }));
            setLastEvent("New mail received");
            setLastUrgent(Boolean(msg?.urgent));
            if (msg?.urgent) {
              setCounts((c) => ({ ...c, urgent: Math.max(0, (c.urgent ?? 0) + 1) }));
            }
          } else if (msg?.type === "mail:update") {
            // server can push absolute counts for safety
            if (typeof msg.unread === "number" || typeof msg.urgent === "number") {
              setCounts((c) => ({
                unread: typeof msg.unread === "number" ? msg.unread : c.unread,
                urgent: typeof msg.urgent === "number" ? msg.urgent : c.urgent,
              }));
            }
          }
        } catch {
          // ignore malformed events
        }
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };

      wsRef.current.onclose = () => {
        retriesRef.current += 1;
        // exponential-ish backoff
        const wait = Math.min(15000, 1000 * Math.pow(2, retriesRef.current));
        setTimeout(() => connect(), wait);
      };
    };

    // start ws
    connect();

    // always keep a polling safety net
    if (pollRef.current) window.clearInterval(pollRef.current);
    loadCounts();
    pollRef.current = window.setInterval(loadCounts, 30000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [wsUrl, externalId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetLastEvent = () => setLastEvent("");

  return { counts, lastEvent, lastUrgent, resetLastEvent, reload: loadCounts };
}
