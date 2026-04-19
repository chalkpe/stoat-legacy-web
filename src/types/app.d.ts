declare interface Window {
  ToastApp: {
    clientReady: boolean;
    subscribePush(payload: { endpoint: string; p256dh: string; auth: string; }): Promise<boolean>;
    unsubscribePush(): Promise<boolean>;
    open(url: string): void;
    handleOnBackPressed(): void;
    getSessionToken(): string | null;
  };
}