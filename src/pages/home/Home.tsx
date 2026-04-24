import { Home as HomeIcon } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import styled from "styled-components/macro";
import { Channel, Message } from "revolt.js";
import { decodeTime } from "ulid";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";
import { useState, useEffect } from "preact/hooks";

import { PageHeader } from "../../components/ui/Header";
import { useClient } from "../../controllers/client/ClientController";
import ChannelIcon from "../../components/common/ChannelIcon";
import ServerIcon from "../../components/common/ServerIcon";
import UserIcon from "../../components/common/user/UserIcon";

const Overlay = styled.div`
    display: grid;
    height: 100%;

    > * {
        grid-area: 1 / 1;
    }

    .content {
        z-index: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
`;

const SKELETON_WIDTHS = ["72%", "88%", "60%", "80%"];

const ChannelTile = observer(({ channel }: { channel: Channel }) => {
    const history = useHistory();
    const [messages, setMessages] = useState<Message[] | null>(null);

    useEffect(() => {
        channel
            .fetchMessagesWithUsers({ limit: 4 })
            .then(({ messages }) => setMessages(messages.reverse()))
            .catch(() => setMessages([]));
    }, [channel._id]);

    const channelName =
        channel.channel_type === "DirectMessage"
            ? ((channel.recipient as any)?.display_name ??
              channel.recipient?.username ??
              "Unknown")
            : channel.channel_type === "TextChannel"
              ? [channel.server?.name, channel.name].filter(Boolean).join(" · ")
              : (channel.name ?? "Unknown");

    return (
        <div
            className={styles.tile}
            onClick={() => history.push(`/channel/${channel._id}`)}>
            <div className={styles.tileHeader}>
                {channel.channel_type === "DirectMessage" ? (
                    <UserIcon target={channel.recipient} size={24} />
                ) : channel.channel_type === "TextChannel" ? (
                    <ServerIcon target={channel.server} size={24} />
                ) : (
                    <ChannelIcon target={channel} size={24} />
                )}
                <span className={styles.tileName}>{channelName}</span>
            </div>
            <div className={styles.messageList}>
                {messages === null ? (
                    SKELETON_WIDTHS.map((width, i) => (
                        <div
                            key={i}
                            className={styles.skeletonRow}
                            style={{ width }}
                        />
                    ))
                ) : (
                    messages
                        .filter((m) => m.content)
                        .map((msg) => (
                            <div key={msg._id} className={styles.messageRow}>
                                <span className={styles.timestamp}>
                                    {new Date(
                                        decodeTime(msg._id),
                                    ).toLocaleTimeString("ko-KR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    })}
                                </span>
                                <span className={styles.authorName}>
                                    {(msg.author as any)?.display_name ??
                                        msg.author?.username}
                                </span>
                                {msg.content!.replace(/\n+/g, " ")}
                            </div>
                        ))
                )}
            </div>
        </div>
    );
});

export default observer(() => {
    const client = useClient();

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentChannels = [...client.channels.values()]
        .filter((ch) => {
            if (
                !(
                    (ch.channel_type === "DirectMessage" && ch.active) ||
                    ch.channel_type === "Group" ||
                    ch.channel_type === "TextChannel"
                )
            )
                return false;
            try {
                return decodeTime(ch.last_message_id_or_past) >= oneDayAgo;
            } catch {
                return false;
            }
        })
        .sort((a, b) =>
            b.last_message_id_or_past.localeCompare(
                a.last_message_id_or_past,
            ),
        );

    return (
        <div className={styles.home}>
            <Overlay>
                <div className="content">
                    <PageHeader icon={<HomeIcon size={24} />}>
                        <Text id="app.navigation.tabs.home" />
                    </PageHeader>
                    <div className={styles.homeScreen}>
                        {recentChannels.length > 0 && (
                            <div className={styles.recentSection}>
                                <div className={styles.sectionTitle}>
                                    최근 대화
                                </div>
                                <div className={styles.grid}>
                                    {recentChannels.map((ch) => (
                                        <ChannelTile
                                            key={ch._id}
                                            channel={ch}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Overlay>
        </div>
    );
});
