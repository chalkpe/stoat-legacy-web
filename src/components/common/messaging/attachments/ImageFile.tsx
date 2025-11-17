import type { LightGallery as LG } from "lightgallery/lightgallery";
import lgRotate from "lightgallery/plugins/rotate";
import lgVideo from "lightgallery/plugins/video";
import lgZoom from "lightgallery/plugins/zoom";
import LightGallery from "lightgallery/react";

import styles from "./Attachment.module.scss";
import classNames from "classnames";
import "lightgallery/scss/lg-rotate.scss";
import "lightgallery/scss/lg-video.scss";
import "lightgallery/scss/lg-zoom.scss";
import "lightgallery/scss/lightgallery.scss";
import { memo } from "preact/compat";
import { useRef, useState, useEffect } from "preact/hooks";

enum ImageLoadingState {
    Loading,
    Loaded,
    Error,
}

type Props = JSX.HTMLAttributes<HTMLImageElement> & {
    url: string;
    filename: string;
};

function ImageFile({ url, filename, open, ...props }: Props) {
    const ref = useRef<LG | null>(null);
    const [loading, setLoading] = useState(ImageLoadingState.Loading);

    useEffect(() => {
        const onBackPressed = (e: Event) => {
            if (ref.current?.lgOpened) {
                e.preventDefault();
                ref.current?.closeGallery();
            }
        };
        window.addEventListener("toast:onbackpressed", onBackPressed);
        return () =>
            window.removeEventListener("toast:onbackpressed", onBackPressed);
    }, []);

    const handleOpenGallery = () => {
        ref.current?.openGallery();
    };

    return (
        <LightGallery
            elementClassNames={styles.lightgallery}
            licenseKey="GPLv3"
            plugins={[lgRotate, lgVideo, lgZoom]}
            onInit={({ instance }) => {
                ref.current = instance;
                if (open) {
                    instance.openGallery();
                }
            }}
            counter={false}
            dynamic
            dynamicEl={[
                { src: url, thumb: url, subHtml: `<h4>${filename}</h4>` },
            ]}>
            <img
                {...props}
                src={url}
                alt={filename}
                loading="lazy"
                className={classNames(styles.image, {
                    [styles.loading]: loading !== ImageLoadingState.Loaded,
                })}
                onClick={handleOpenGallery}
                onMouseDown={(ev) =>
                    ev.button === 1 && window.open(url, "_blank")
                }
                onLoad={() => setLoading(ImageLoadingState.Loaded)}
                onError={() => setLoading(ImageLoadingState.Error)}
            />
        </LightGallery>
    );
}

export default memo(ImageFile);
