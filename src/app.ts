import { autorun } from "mobx"
import { history } from "./context/history"
import { clientController } from "./controllers/client/ClientController"

window.ToastApp = {
  open(url: string) {
    history.push(url)
    console.info('[ToastApp] Navigated to:', url)
  },
  subscribePush: async () => false,
  unsubscribePush: async () => false,
}

function initializeToastAppPushFeatures() {
  const client = clientController.getReadyClient()
  if (!client) return

  window.ToastApp.subscribePush = async (payload) => {
    return await client.api.post('/push/subscribe', payload)
      .then(() => true)
      .catch((err) => {
        console.error('Failed to subscribe to push notifications:', err)
        return false
      })
  }

  window.ToastApp.unsubscribePush = async () => {
    return await client.api.post('/push/unsubscribe')
      .then(() => true)
      .catch((err) => {
        console.error('Failed to unsubscribe from push notifications:', err)
        return false
      })
  }

  console.info('[ToastApp] Initialized push features with credentials:', `${client.user?.username}#${client.user?.discriminator}`)
}

// Watch for client to be ready with proper authentication and initialize push features
autorun(() => {
  const isLoggedIn = clientController.isLoggedIn()
  const isReady = clientController.isReady()
  
  if (isLoggedIn && isReady) {
    initializeToastAppPushFeatures()
  }
})
