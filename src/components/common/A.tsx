import React, { useCallback } from "react";

type Props = Omit<React.ComponentProps<'a'>, 'href' | 'onClick'> & {
    href: string;
    onClick?: () => void;
    metadataType?: string;
};

export const A: React.FC<Props> = ({ name, href, download, metadataType, onClick, children, ...props }) => {
    const handleClick = useCallback((e: MouseEvent) => {
        if ('webkit' in window) {
            e.preventDefault();
            const webkit = window.webkit as any;
            webkit.messageHandlers.windowOpenHandler.postMessage({ url: href, download, name, type: metadataType });
        } else {
            onClick?.();
        }
    }, [href, onClick, download, metadataType, name]);

    return (
        <a {...props} href={href} download={download} onClick={handleClick}>
            {children}
        </a>
    )
}