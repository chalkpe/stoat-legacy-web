import { autorun } from "mobx";

import { history } from "./context/history";

import { clientController } from "./controllers/client/ClientController";

function scrollToPanel() {
    const panels = document.querySelector("#app > div > div > div");
    panels?.scrollTo({ behavior: "smooth", left: panels.clientWidth });
}

function markReadOpenChannel(url: string) {
    const client = clientController.getReadyClient();
    if (!client) return;

    const match = url.match(/\/channel\/(.+)$/);
    if (match) client.unreads!.markRead(match[1], undefined, true, true);
}

window.ToastApp = {
    open(url: string) {
        history.push(url);
        scrollToPanel();
        markReadOpenChannel(url);
        console.info("[ToastApp] Navigated to:", url);
    },
    subscribePush: async () => false,
    unsubscribePush: async () => false,
    handleOnBackPressed() {
        console.info("[ToastApp] Back pressed");

        const e = new CustomEvent("toast:onbackpressed", { cancelable: true });
        if (!window.dispatchEvent(e)) return;

        const panels = document.querySelector("#app > div > div > div");
        panels?.scrollTo({
            behavior: "smooth",
            left:
                panels.scrollLeft > panels.clientWidth
                    ? panels.clientWidth
                    : panels.scrollLeft > 0
                    ? 0
                    : panels.clientWidth,
        });
    },
};

function initializeToastAppPushFeatures() {
    const client = clientController.getReadyClient();
    if (!client) return;

    window.ToastApp.subscribePush = async (payload) => {
        return await client.api
            .post("/push/subscribe", payload)
            .then(() => true)
            .catch((err) => {
                console.error(
                    "Failed to subscribe to push notifications:",
                    err,
                );
                return false;
            });
    };

    window.ToastApp.unsubscribePush = async () => {
        return await client.api
            .post("/push/unsubscribe")
            .then(() => true)
            .catch((err) => {
                console.error(
                    "Failed to unsubscribe from push notifications:",
                    err,
                );
                return false;
            });
    };

    console.info(
        "[ToastApp] Initialized push features with credentials:",
        `${client.user?.username}#${client.user?.discriminator}`,
    );
}

// Watch for client to be ready with proper authentication and initialize push features
autorun(() => {
    const isLoggedIn = clientController.isLoggedIn();
    const isReady = clientController.isReady();

    if (isLoggedIn && isReady) {
        initializeToastAppPushFeatures();
    }
});
