/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";

declare const API_URL: string;

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket!: Socket;

  public open(email?: string): void {
    this.socket = io(API_URL, { query: { email } });
  }

  public emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  public on(event: string, handler: (data: any) => void): void {
    this.socket.on(event, handler);
  }

  public close(): void {
    if (this.socket) this.socket.disconnect();
  }
}
