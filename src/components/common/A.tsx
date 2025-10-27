import React, { useCallback } from "react";

type Props = Omit<React.ComponentProps<'a'>, 'href' | 'onClick'> & {
    href: string;
    onClick?: () => void;
};

export const A: React.FC<Props> = ({ href, onClick, children, ...props }) => {
    const handleClick = useCallback(() => {
        if ('webkit' in window) {
            const webkit = window.webkit as any;
            webkit.messageHandlers.windowOpenHandler.postMessage({ url: href });
        } else {
            onClick?.();
        }
    }, [href, onClick]);

    return (
        <a href={href} {...props} onClick={handleClick}>
            {children}
        </a>
    )
}