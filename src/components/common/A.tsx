import React, { useCallback } from "react";

type Props = Omit<React.ComponentProps<'a'>, 'href' | 'onClick'> & {
    href: string;
    onClick?: () => void;
};

export const A: React.FC<Props> = ({ href, download, onClick, children, ...props }) => {
    const handleClick = useCallback(() => {
        if ('webkit' in window) {
            const webkit = window.webkit as any;
            webkit.messageHandlers.windowOpenHandler.postMessage({ url: href, download });
        } else {
            onClick?.();
        }
    }, [href, onClick]);

    return (
        <a {...props} href={href} download={download} onClick={handleClick}>
            {children}
        </a>
    )
}