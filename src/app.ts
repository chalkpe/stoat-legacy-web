import { autorun } from "mobx"
import { history } from "./context/history"
import { clientController } from "./controllers/client/ClientController"

function initializeToastApp() {
  const client = clientController.getReadyClient()
  if (!client) return

  window.ToastApp = {
    async subscribePush(payload) {
      return await client.api.post('/push/subscribe', payload)
        .then(() => true)
        .catch((err) => {
          console.error('Failed to subscribe to push notifications:', err)
          return false
        })
    },
    async unsubscribePush() {
      return await client.api.post('/push/unsubscribe')
        .then(() => true)
        .catch((err) => {
          console.error('Failed to unsubscribe from push notifications:', err)
          return false
        })
    },
    open(url: string) {
      history.push(url)
      console.info('[ToastApp] Navigated to:', url)
    }
  }

  console.info('[ToastApp] Initialized with credentials:', `${client.user?.username}#${client.user?.discriminator}`)
}

// Watch for client to be ready with proper authentication and initialize ToastApp
autorun(() => {
  const isLoggedIn = clientController.isLoggedIn()
  const isReady = clientController.isReady()
  
  if (isLoggedIn && isReady) {
    initializeToastApp()
  }
})