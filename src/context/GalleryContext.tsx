import type { LightGallery as LG } from "lightgallery/lightgallery";

import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgRotate from "lightgallery/plugins/rotate";
import lgZoom from "lightgallery/plugins/zoom";
import LightGallery from "lightgallery/react";

import 'lightgallery/scss/lg-thumbnail.scss';
import "lightgallery/scss/lg-rotate.scss";
import "lightgallery/scss/lg-zoom.scss";
import "lightgallery/scss/lightgallery.scss";


import { createContext, ComponentChildren } from "preact";
import { useContext, useRef, useCallback, useEffect } from "preact/hooks";

import { useClient } from "../controllers/client/ClientController";

interface GalleryImage {
    src: string;
    thumb: string;
    subHtml: string;
    messageId: string;
    download: string;
}

interface Attachment {
    _id: string;
    filename: string;
    metadata: { type: string };
    message_id: string;
}

interface MessageAttachment {
    _id: string;
    filename: string;
    metadata: { type: string };
}

interface GalleryContextValue {
    openGallery: (
        channelId: string,
        messageId: string,
        imageUrl: string,
        filename: string,
        messageAttachments?: MessageAttachment[],
        generateFileURL?: (attachment: MessageAttachment) => string,
    ) => void;
}

const GalleryContext = createContext<GalleryContextValue>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    openGallery: () => {},
});

const FETCH_LIMIT = 50;

interface GalleryProviderProps {
    children: ComponentChildren;
}

export function GalleryProvider({ children }: GalleryProviderProps) {
    const client = useClient();
    const lgRef = useRef<LG | null>(null);
    const currentChannelRef = useRef<string | null>(null);
    const currentIndexRef = useRef(0);
    const loadingBeforeRef = useRef(false);
    const loadingAfterRef = useRef(false);
    const hasMoreBeforeRef = useRef(true);
    const hasMoreAfterRef = useRef(true);
    const isOpenRef = useRef(false);
    const galleryImagesRef = useRef<GalleryImage[]>([]);
    const isAdjustingRef = useRef(false); // Flag to prevent slide event during index adjustment

    const fetchAttachments = useCallback(
        async (channelId: string, direction: "before" | "after", referenceMessageId: string) => {
            const session = client.session;
            const token = typeof session === "string" ? session : session?.token;
            if (!token) return [];

            try {
                const params = new URLSearchParams({
                    limit: FETCH_LIMIT.toString(),
                    [direction]: referenceMessageId,
                    sort: direction === "before" ? "Latest" : "Oldest",
                });

                const response = await fetch(
                    `${client.apiURL}/channels/${channelId}/attachments?${params}`,
                    {
                        headers: {
                            "x-session-token": token,
                        },
                    },
                );

                if (!response.ok) return [];

                const data = await response.json();
                const attachments: Attachment[] = data.attachments || [];

                const imageAttachments = attachments.filter(
                    (att) => att.metadata?.type === "Image",
                );

                return imageAttachments.map((att) => ({
                    src: `${client.configuration?.features.autumn.url}/attachments/${att._id}`,
                    thumb: `${client.configuration?.features.autumn.url}/attachments/${att._id}`,
                    subHtml: `<h4>${att.filename}</h4>`,
                    messageId: att.message_id,
                    download: att.filename,
                }));
            } catch (e) {
                console.error("Failed to fetch attachments:", e);
                return [];
            }
        },
        [client],
    );

    const loadMoreImages = useCallback(
        async (direction: "before" | "after") => {
            const channelId = currentChannelRef.current;
            if (!channelId || !isOpenRef.current) return;

            const images = galleryImagesRef.current;
            if (images.length === 0) return;

            // For "before" we need older images (use first image's messageId)
            // For "after" we need newer images (use last image's messageId)
            const referenceMessageId =
                direction === "before"
                    ? images[0]?.messageId
                    : images[images.length - 1]?.messageId;

            if (!referenceMessageId) return;

            if (direction === "before") {
                if (loadingBeforeRef.current || !hasMoreBeforeRef.current) return;
                loadingBeforeRef.current = true;
            } else {
                if (loadingAfterRef.current || !hasMoreAfterRef.current) return;
                loadingAfterRef.current = true;
            }

            const newImages = await fetchAttachments(channelId, direction, referenceMessageId);

            if (newImages.length === 0) {
                if (direction === "before") {
                    hasMoreBeforeRef.current = false;
                } else {
                    hasMoreAfterRef.current = false;
                }
            } else {
                const existingIds = new Set(galleryImagesRef.current.map((img) => img.src));
                const uniqueNewImages = newImages.filter(
                    (img) => !existingIds.has(img.src),
                );

                if (uniqueNewImages.length > 0 && lgRef.current && isOpenRef.current) {
                    // Set flag to ignore slide events during refresh
                    isAdjustingRef.current = true;
                    const currentIdx = currentIndexRef.current;
                    
                    if (direction === "before") {
                        // API with sort=Latest returns newest first, reverse to get chronological order (oldest first)
                        const sortedNew = [...uniqueNewImages].reverse();
                        const indexShift = sortedNew.length;
                        
                        // Prepend older images
                        galleryImagesRef.current = [...sortedNew, ...galleryImagesRef.current];
                        
                        // Calculate new index BEFORE refresh
                        const newIndex = currentIdx + indexShift;
                        currentIndexRef.current = newIndex;
                        
                        // Refresh with new array
                        lgRef.current.refresh(galleryImagesRef.current);
                        
                        // Use requestAnimationFrame to ensure DOM is updated before sliding
                        requestAnimationFrame(() => {
                            if (lgRef.current && isOpenRef.current) {
                                lgRef.current.slide(newIndex, false);
                            }
                            // Reset flag after slide completes
                            setTimeout(() => {
                                isAdjustingRef.current = false;
                            }, 100);
                        });
                    } else {
                        // API with sort=Oldest returns oldest first - append as-is
                        galleryImagesRef.current = [...galleryImagesRef.current, ...uniqueNewImages];
                        
                        // Refresh with new array - index stays the same
                        lgRef.current.refresh(galleryImagesRef.current);
                        
                        // Restore current position after refresh
                        requestAnimationFrame(() => {
                            if (lgRef.current && isOpenRef.current) {
                                lgRef.current.slide(currentIdx, false);
                            }
                            setTimeout(() => {
                                isAdjustingRef.current = false;
                            }, 100);
                        });
                    }
                } else if (newImages.length < FETCH_LIMIT) {
                    // If we got some images but less than limit, mark as no more
                    if (direction === "before") {
                        hasMoreBeforeRef.current = false;
                    } else {
                        hasMoreAfterRef.current = false;
                    }
                }
            }

            if (direction === "before") {
                loadingBeforeRef.current = false;
            } else {
                loadingAfterRef.current = false;
            }
        },
        [fetchAttachments],
    );

    const handleSlideChange = useCallback(
        (index: number) => {
            // Ignore slide events during index adjustment
            if (isAdjustingRef.current) {
                return;
            }
            
            currentIndexRef.current = index;

            // Preload more images when near the edges
            if (index <= 2 && hasMoreBeforeRef.current && !loadingBeforeRef.current) {
                loadMoreImages("before");
            }
            if (index >= galleryImagesRef.current.length - 3 && hasMoreAfterRef.current && !loadingAfterRef.current) {
                loadMoreImages("after");
            }
        },
        [loadMoreImages],
    );

    const handleInit = useCallback((detail: { instance: LG }) => {
        lgRef.current = detail.instance;
    }, []);

    const handleAfterSlide = useCallback(
        ({ index }: { index: number }) => {
            handleSlideChange(index);
        },
        [handleSlideChange],
    );

    const handleBeforeClose = useCallback(() => {
        isOpenRef.current = false;
    }, []);

    const handleAfterOpen = useCallback(() => {
        isOpenRef.current = true;
    }, []);

    const openGallery = useCallback(
        async (
            channelId: string,
            messageId: string,
            imageUrl: string,
            filename: string,
            messageAttachments?: MessageAttachment[],
            generateFileURL?: (attachment: MessageAttachment) => string,
        ) => {
            if (!lgRef.current) return;

            // Reset state
            currentChannelRef.current = channelId;
            loadingBeforeRef.current = false;
            loadingAfterRef.current = false;
            hasMoreBeforeRef.current = true;
            hasMoreAfterRef.current = true;

            // Build initial images from message attachments (if provided)
            let initialImages: GalleryImage[] = [];
            let clickedIndex = 0;

            if (messageAttachments && generateFileURL) {
                // Filter to only image attachments
                const imageAttachments = messageAttachments.filter(
                    (att) => att.metadata?.type === "Image",
                );
                
                initialImages = imageAttachments.map((att) => {
                    const url = generateFileURL(att);
                    return {
                        src: url,
                        thumb: url,
                        subHtml: `<h4>${att.filename}</h4>`,
                        messageId,
                        download: att.filename,
                    };
                });

                // Find the index of the clicked image
                clickedIndex = initialImages.findIndex((img) => img.src === imageUrl);
                if (clickedIndex === -1) clickedIndex = 0;
            } else {
                // Fallback: single image
                initialImages = [{
                    src: imageUrl,
                    thumb: imageUrl,
                    subHtml: `<h4>${filename}</h4>`,
                    messageId,
                    download: filename,
                }];
            }

            // Fetch images before and after in parallel BEFORE opening gallery
            const [beforeImages, afterImages] = await Promise.all([
                fetchAttachments(channelId, "before", messageId),
                fetchAttachments(channelId, "after", messageId),
            ]);

            // Build the full image array: [older...] + [current message images] + [...newer]
            // beforeImages with sort=Latest comes newest-first, reverse for chronological
            const olderImages = [...beforeImages].reverse();
            // afterImages with sort=Oldest comes oldest-first, keep as-is
            const newerImages = afterImages;

            // Filter duplicates - exclude all images from current message
            const initialSrcs = new Set(initialImages.map(img => img.src));
            const filteredOlder = olderImages.filter(img => !initialSrcs.has(img.src));
            const filteredNewer = newerImages.filter(img => !initialSrcs.has(img.src));

            // Combine: older + current message images + newer
            const allImages = [...filteredOlder, ...initialImages, ...filteredNewer];
            
            // Calculate the final index of the clicked image
            const finalClickedIndex = filteredOlder.length + clickedIndex;

            galleryImagesRef.current = allImages;
            currentIndexRef.current = finalClickedIndex;

            // Update hasMore flags
            if (beforeImages.length < FETCH_LIMIT) {
                hasMoreBeforeRef.current = false;
            }
            if (afterImages.length < FETCH_LIMIT) {
                hasMoreAfterRef.current = false;
            }

            // Open gallery at the correct index
            lgRef.current.refresh(allImages);
            lgRef.current.openGallery(finalClickedIndex);
        },
        [fetchAttachments],
    );

    useEffect(() => {
        const onBackPressed = (e: Event) => {
            if (lgRef.current?.lgOpened) {
                e.preventDefault();
                lgRef.current?.closeGallery();
            }
        };
        window.addEventListener("toast:onbackpressed", onBackPressed);
        return () =>
            window.removeEventListener("toast:onbackpressed", onBackPressed);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (lgRef.current) {
                lgRef.current.destroy();
                lgRef.current = null;
            }
        };
    }, []);

    return (
        <GalleryContext.Provider value={{ openGallery }}>
            {children}
            <LightGallery
                licenseKey="GPLv3"
                plugins={[lgThumbnail, lgRotate, lgZoom]}
                onInit={handleInit}
                onAfterSlide={handleAfterSlide}
                onBeforeClose={handleBeforeClose}
                onAfterOpen={handleAfterOpen}
                dynamic
                dynamicEl={[]}
                loop={false}
                download={true}
                mobileSettings={{ download: true }}
            />
        </GalleryContext.Provider>
    );
}

export function useGallery() {
    return useContext(GalleryContext);
}
