import styled, { css } from "styled-components";

import { useState } from "preact/hooks";

import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

const Spoiler = styled.span<{ shown: boolean }>`
    margin: 1px;
    display: inline-block;
    padding: 0 4px;
    cursor: pointer;
    user-select: none;
    color: transparent;
    background: #000000;
    box-sizing: border-box;
    border: 2px solid #000000;
    border-radius: var(--border-radius);

    > * {
        opacity: 0;
        pointer-events: none;
    }

    ${(props) =>
        props.shown &&
        css`
            cursor: auto;
            user-select: none;
            color: var(--foreground);
            background: repeating-linear-gradient(
                45deg,
                var(--secondary-background),
                var(--secondary-background) 8px,
                transparent 8px,
                transparent 16px
            );
            border-color: var(--secondary-foreground);
            border-style: dashed;

            > * {
                opacity: 1;
                pointer-events: unset;
            }
        `}
`;

export function RenderSpoiler({ match }: CustomComponentProps) {
    const [shown, setShown] = useState(false);

    return (
        <Spoiler shown={shown} onClick={(e) => setShown((shown) => !shown)}>
            {match}
        </Spoiler>
    );
}

export const remarkSpoiler = createComponent("spoiler", /\[\[([\s\S]+?)\]\]/gm);
