import { clientController } from "../controllers/client/ClientController";

export interface ChannelEventPayload {
    type: 'open' | 'close';
}

export async function sendChannelEvent(channelId: string, payload: ChannelEventPayload) {
    try {
        const client = clientController.getReadyClient();
        if (!client) return;

        // PUT /channels/:id -- unoffical!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (client.api as any).put(`/channels/${channelId}`, payload);
    } catch (error) {
        console.error('Failed to send channel event:', error);
    }
}

export function trackChannelOpen(channelId: string) {
    const payload: ChannelEventPayload = { type: 'open' };
    sendChannelEvent(channelId, payload);
}

export function trackChannelClose(channelId: string) {
    const payload: ChannelEventPayload = { type: 'close' };    
    sendChannelEvent(channelId, payload);
}