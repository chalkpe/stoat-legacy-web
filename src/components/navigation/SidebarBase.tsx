import styled, { css } from "styled-components/macro";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

export default styled.div`
    height: 100%;
    display: flex;
    user-select: none;
    flex-direction: row;
    align-items: stretch;
    /*background: var(--background);*/

    background-color: rgba(
        var(--background-rgb),
        max(var(--min-opacity), 0.75)
    );
    backdrop-filter: blur(20px);
`;

export const GenericSidebarBase = styled.div<{
    mobilePadding?: boolean;
}>`
    height: 100%;
    width: calc(100vw - 56px);
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: var(--secondary-background);
`;

export const GenericSidebarList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > img {
        width: 100%;
    }
`;
