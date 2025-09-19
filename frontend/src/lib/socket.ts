'use client';

import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket) return this.socket;

    // Obtener base URL sin "/api" ni barras finales
    const rawApi = process.env.NEXT_PUBLIC_API_URL || 'https://backendotravez.vercel.app';
    const cleaned = rawApi.replace(/\/+$/, '').replace(/\/api$/, '');

    this.socket = io(cleaned, {
      // Opcional: si tu backend pide transporte o path especial
      withCredentials: true, // si usas cookies o sesiones
      // Si defines un path custom en socket.io en el servidor, usarlo
      // path: '/socket.io'  // si lo cambiaste
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const socketClient = new SocketClient();
