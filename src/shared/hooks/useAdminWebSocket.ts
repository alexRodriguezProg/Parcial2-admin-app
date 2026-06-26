import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';

/** Hook que conecta al WebSocket de pedidos para administradores e invalida React Query. */
export function useAdminWebSocket() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!token) return;

    const WS_BASE = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000';
    const url = `${WS_BASE}/ws/admin/pedidos?token=${token}`;

    const connect = () => {
      if (!mountedRef.current) return;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'pago_verificado' || msg.estado_nuevo) {
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            if (msg.pedido_id) {
              queryClient.invalidateQueries({ queryKey: ['pedido', msg.pedido_id] });
            }
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (mountedRef.current) {
          reconnectRef.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token, queryClient]);
}
