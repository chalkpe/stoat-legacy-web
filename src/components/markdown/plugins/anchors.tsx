import { Link } from "react-router-dom";

import { determineLink } from "../../../lib/links";

import { modalController } from "../../../controllers/modals/ModalController";

const replace = (str?: unknown): string | undefined => (typeof str === "string" ? str.replace(/%5C/g, "").replace(/\\/g, "") : undefined);

export function RenderAnchor({
    href: _href,
    children: _children,
    ...props
}: JSX.HTMLAttributes<HTMLAnchorElement>) {
    // Unescape markdown escaped characters
    const href = replace(_href);
    const children = Array.isArray(_children) ? _children.map(replace) : replace(_children);

    // Pass-through no href or if anchor
    if (!href || href.startsWith("#")) return <a href={href} children={children} {...props} />;

    // Determine type of link
    const link = determineLink(href);
    if (link.type === "none") return <a children={children} {...props} />;

    // Render direct link if internal
    if (link.type === "navigate") {
        return <Link to={link.path} children={children} />;
    }

    return (
        <a
            {...props}
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(ev) =>
                modalController.openLink(
                    href,
                    undefined,
                    ev.currentTarget.innerText !== href,
                ) && ev.preventDefault()
            }
            children={children}
        />
    );
}
