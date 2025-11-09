import { API } from "revolt.js";

import LightGallery from 'lightgallery/react';
import lgRotate from 'lightgallery/plugins/rotate';
import lgVideo from 'lightgallery/plugins/video';
import lgZoom from 'lightgallery/plugins/zoom';
import type { LightGallery as LG } from "lightgallery/lightgallery";

import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-rotate.scss';
import 'lightgallery/scss/lg-video.scss';
import 'lightgallery/scss/lg-zoom.scss';

import styles from "./Attachment.module.scss";
import classNames from "classnames";

import { memo } from "preact/compat";
import { useRef, useState, useEffect } from "preact/hooks";

import { useClient } from "../../../../controllers/client/ClientController";

enum ImageLoadingState {
    Loading,
    Loaded,
    Error,
}

type Props = JSX.HTMLAttributes<HTMLImageElement> & {
    attachment: API.File;
};

function ImageFile({ attachment, ...props }: Props) {
    const [loading, setLoading] = useState(ImageLoadingState.Loading);
    const client = useClient();
    const url = client.generateFileURL(attachment)!;
    const ref = useRef<LG | null>(null);

    useEffect(() => {
        const handlePopState = () => {
            if (ref.current?.lgOpened) ref.current?.closeGallery();
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleOpenGallery = () => {
        ref.current?.openGallery();
        window.history.pushState(null, '');
    };

    return (
        <LightGallery 
            licenseKey="GPLv3"
            plugins={[lgRotate, lgVideo, lgZoom]}
            onInit={({ instance }) => ref.current = instance}
            counter={false}
            dynamic
            dynamicEl={[{ src: url, thumb: url, subHtml: `<h4>${attachment.filename}</h4>` }]}
        > 
            <img
                {...props}
                src={url}
                alt={attachment.filename}
                loading="lazy"
                className={classNames(styles.image, {
                    [styles.loading]: loading !== ImageLoadingState.Loaded,
                })}
                onClick={handleOpenGallery}
                onMouseDown={(ev) => ev.button === 1 && window.open(url, "_blank")}
                onLoad={() => setLoading(ImageLoadingState.Loaded)}
                onError={() => setLoading(ImageLoadingState.Error)}
            />
        </LightGallery>
    );
}

export default memo(ImageFile);
