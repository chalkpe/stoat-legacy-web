import { At, Hash } from "@styled-icons/boxicons-regular";
import { Notepad, Group } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Channel, User } from "revolt.js";
import styled from "styled-components/macro";

import { useStatusColour } from "../../components/common/user/UserIcon";
import { PageHeader } from "../../components/ui/Header";
import { ChannelName } from "../../controllers/client/jsx/ChannelName";
import HeaderActions from "./actions/HeaderActions";

export interface ChannelHeaderProps {
    channel: Channel;
    toggleSidebar?: () => void;
    toggleChannelSidebar?: () => void;
}

const Info = styled.div`
    flex-grow: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;

    display: flex;
    gap: 8px;
    align-items: center;

    * {
        display: inline-block;
    }

    .divider {
        height: 20px;
        margin: 0 5px;
        padding-left: 1px;
        background-color: var(--tertiary-background);
    }

    .status {
        width: 8px;
        height: 8px;
        display: inline-block;
        border-radius: var(--border-radius-half);
    }

    .desc {
        cursor: pointer;
        font-size: 0.8em;
        font-weight: 400;
        color: var(--secondary-foreground);

        > * {
            pointer-events: none;
        }
    }
`;

export default observer(({ channel }: ChannelHeaderProps) => {
    let icon, recipient: User | undefined;
    switch (channel.channel_type) {
        case "SavedMessages":
            icon = <Notepad size={24} />;
            break;
        case "DirectMessage":
            icon = <></>;
            recipient = channel.recipient;
            break;
        case "Group":
            icon = <Group size={24} />;
            break;
        case "TextChannel":
            icon = <Hash size={24} />;
            break;
    }

    return (
        <PageHeader icon={icon} style={{ backgroundColor: 'var(--primary-background)' }}>
            <Info>
                <span className="name">
                    <ChannelName channel={channel} />
                </span>
                {channel.channel_type === "DirectMessage" && (
                    <>
                        <span className="desc">
                            <div
                                className="status"
                                style={{
                                    backgroundColor:
                                        useStatusColour(recipient),
                                }}
                            />
                            {/* <UserStatus user={recipient} /> */}
                        </span>
                    </>
                )}
            </Info>
            <HeaderActions channel={channel} />
        </PageHeader>
    );
});
