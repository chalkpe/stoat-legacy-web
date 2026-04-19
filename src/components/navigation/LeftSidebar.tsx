import { observer } from "mobx-react-lite";
import { Route, Switch } from "react-router";
import { useLocation } from "react-router-dom";

import SidebarBase from "./SidebarBase";
import HomeSidebar from "./left/HomeSidebar";
import ServerListSidebar from "./left/ServerListSidebar";
import ServerSidebar from "./left/ServerSidebar";

export default observer(() => {
    const { pathname } = useLocation();
    const isOpen = !pathname.startsWith("/discover");

    return (
        <SidebarBase>
            <Switch>
                <Route path="/settings">
                    <ServerListSidebar />
                    {isOpen && <HomeSidebar />}
                </Route>
                <Route path="/server/:server/channel/:channel">
                    <ServerListSidebar />
                    {isOpen && <ServerSidebar />}
                </Route>
                <Route path="/server/:server">
                    <ServerListSidebar />
                    {isOpen && <ServerSidebar />}
                </Route>
                <Route path="/channel/:channel">
                    <ServerListSidebar />
                    {isOpen && <HomeSidebar />}
                </Route>
                <Route path="/">
                    <ServerListSidebar />
                    {isOpen && <HomeSidebar />}
                </Route>
            </Switch>
        </SidebarBase>
    );
});
