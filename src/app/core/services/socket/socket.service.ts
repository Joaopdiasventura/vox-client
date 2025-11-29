/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;

  public open(email?: string): void {
    this.socket = io(API_URL, { query: { email } });
  }

  public emit(
    event: string,
    data?: any,
    callback?: (...args: any[]) => void,
  ): void {
    if (!this.socket) return;
    if (callback) this.socket.emit(event, data, callback);
    else this.socket.emit(event, data);
  }

  public on(event: string, handler: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  public off(event: string, handler: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  public close(): void {
    if (this.socket) this.socket.disconnect();
  }
}
