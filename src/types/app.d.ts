declare interface Window {
  ToastApp: {
    subscribePush(payload: { endpoint: string; p256dh: string; auth: string; }): Promise<void>;
    unsubscribePush(): Promise<void>;
    open(url: string): void;
  };
}