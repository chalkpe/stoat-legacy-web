import {
    LinkExternal,
    Headphone,
    Download,
} from "@styled-icons/boxicons-regular";
import { File, Video } from "@styled-icons/boxicons-solid";
import { isFirefox } from "react-device-detect";
import { API } from "revolt.js";

import styles from "./AttachmentActions.module.scss";
import classNames from "classnames";
import { useContext } from "preact/hooks";

import { IconButton } from "@revoltchat/ui";

import { determineFileSize } from "../../../../lib/fileSize";

import { useClient } from "../../../../controllers/client/ClientController";
import { A } from "../../A";

interface Props {
    attachment: API.File;
}

export default function AttachmentActions({ attachment }: Props) {
    const client = useClient();
    const { filename, metadata, size } = attachment;

    const url = client.generateFileURL(attachment);
    const open_url = url;
    const download_url = `${url}/${filename}`;

    const filesize = determineFileSize(size);

    switch (metadata.type) {
        case "Image":
            return (
                <div className={classNames(styles.actions, styles.imageAction)}>
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>
                        {`${metadata.width}x${metadata.height}`} ({filesize})
                    </span>
                    <A
                        href={open_url}
                        target="_blank"
                        className={styles.iconType}
                        rel="noopener,noreferrer">
                        <IconButton>
                            <LinkExternal size={24} />
                        </IconButton>
                    </A>
                    <A
                        target="_blank"
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        name={filename}
                        metadataType={metadata.type}
                        // target={isFirefox || window.native ? "_blank" : "_self"}
                        rel="noopener,noreferrer">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </A>
                </div>
            );
        case "Audio":
            return (
                <div className={classNames(styles.actions, styles.audioAction)}>
                    <Headphone size={24} className={styles.iconType} />
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>{filesize}</span>
                    <A
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        name={filename}
                        metadataType={metadata.type}
                        target={isFirefox || window.native ? "_blank" : "_self"}
                        rel="noopener,noreferrer">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </A>
                </div>
            );
        case "Video":
            return (
                <div className={classNames(styles.actions, styles.videoAction)}>
                    <Video size={24} className={styles.iconType} />
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>
                        {`${metadata.width}x${metadata.height}`} ({filesize})
                    </span>
                    <A
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        name={filename}
                        metadataType={metadata.type}
                        target={isFirefox || window.native ? "_blank" : "_self"}
                        rel="noopener,noreferrer">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </A>
                </div>
            );
        default:
            return (
                <div className={styles.actions}>
                    <File size={24} className={styles.iconType} />
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>{filesize}</span>
                    {metadata.type === "Text" && (
                        <A
                            href={open_url}
                            target="_blank"
                            className={styles.externalType}
                            rel="noopener,noreferrer">
                            <IconButton>
                                <LinkExternal size={24} />
                            </IconButton>
                        </A>
                    )}
                    <A
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        name={filename}
                        metadataType={metadata.type}
                        target={isFirefox || window.native ? "_blank" : "_self"}
                        rel="noopener,noreferrer">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </A>
                </div>
            );
    }
}
