import styles from "./Attachment.module.scss";
import classNames from "classnames";
import { memo } from "preact/compat";
import { useState } from "preact/hooks";

import { useGallery } from "../../../../context/GalleryContext";

enum ImageLoadingState {
    Loading,
    Loaded,
    Error,
}

interface MessageAttachment {
    _id: string;
    filename: string;
    metadata: { type: string };
}

type Props = JSX.HTMLAttributes<HTMLImageElement> & {
    url: string;
    filename: string;
    channelId?: string;
    messageId?: string;
    messageAttachments?: MessageAttachment[];
    generateFileURL?: (attachment: MessageAttachment) => string;
};

function ImageFile({ url, filename, channelId, messageId, messageAttachments, generateFileURL, ...props }: Props) {
    const [loading, setLoading] = useState(ImageLoadingState.Loading);
    const { openGallery } = useGallery();

    const handleClick = () => {
        if (channelId && messageId) {
            openGallery(channelId, messageId, url, filename, messageAttachments, generateFileURL);
        }
    };

    return (
        <img
            {...props}
            src={url}
            alt={filename}
            loading="lazy"
            className={classNames(styles.image, {
                [styles.loading]: loading !== ImageLoadingState.Loaded,
            })}
            onClick={handleClick}
            onMouseDown={(ev) =>
                ev.button === 1 && window.open(url, "_blank")
            }
            onLoad={() => setLoading(ImageLoadingState.Loaded)}
            onError={() => setLoading(ImageLoadingState.Error)}
        />
    );
}

export default memo(ImageFile);
