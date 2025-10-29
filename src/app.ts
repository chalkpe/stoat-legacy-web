import { autorun } from "mobx"
import { clientController } from "./controllers/client/ClientController"

function initializeToastApp() {
  const client = clientController.getAvailableClient()
  if (!client) return

  window.ToastApp = {
    async subscribePush(payload) {
      await client.api.post('/push/subscribe', payload)
        .catch((err) => console.error('Failed to subscribe to push notifications:', err))
    },
    async unsubscribePush() {
      await client.api.post('/push/unsubscribe')
        .catch((err) => console.error('Failed to unsubscribe from push notifications:', err))
    }
  }
  console.info('[ToastApp] Initialized with authenticated client')
}

// Watch for client availability and initialize ToastApp
autorun(() => {
  const client = clientController.getAvailableClient()
  if (client) initializeToastApp()
})