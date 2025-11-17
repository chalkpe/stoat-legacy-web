import ImageFile from "../../../components/common/messaging/attachments/ImageFile";
import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";

export default function ImageViewer({
    embed,
    attachment,
}: ModalProps<"image_viewer">) {
    const client = useClient();

    if (attachment && attachment.metadata.type !== "Image") {
        console.warn(
            `Attempted to use a non valid attatchment type in the image viewer: ${attachment.metadata.type}`,
        );
        return null;
    }

    return (
        <>
            {attachment && (
                <ImageFile
                    url={client.generateFileURL(attachment)!}
                    filename={attachment.filename}
                    open
                />
            )}
            {embed && (
                <ImageFile
                    url={client.proxyFile(embed.url)!}
                    filename={embed.url}
                    open
                />
            )}
        </>
    );
}
