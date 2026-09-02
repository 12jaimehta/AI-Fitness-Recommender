"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

function isWebKitMp4ImagePlayback() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const iOS =
        /iP(hone|ad|od)/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const safariDesktop = /Safari/.test(ua) && !/Chrome|Chromium|Android/i.test(ua);
    return iOS || safariDesktop;
}

function SafariMp4Image({ src }: { src: string }) {
    return (
        <picture>
            <source srcSet={src} type="video/mp4" />
            <img
                src={src}
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full object-cover"
            />
        </picture>
    );
}

export default function HeroVideo({ src, active }: { src: string; active: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playback, setPlayback] = useState<"pending" | "video" | "image">("pending");
    const [keepImage, setKeepImage] = useState(active);

    useLayoutEffect(() => {
        setPlayback(isWebKitMp4ImagePlayback() ? "image" : "video");
    }, []);

    useEffect(() => {
        if (playback !== "image") return;
        if (active) {
            setKeepImage(true);
            return;
        }
        const hide = window.setTimeout(() => setKeepImage(false), 900);
        return () => window.clearTimeout(hide);
    }, [active, playback]);

    useEffect(() => {
        if (playback !== "video") return;
        const video = videoRef.current;
        if (!video) return;

        video.defaultMuted = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("webkit-playsinline", "true");

        let retryTimer: number | undefined;

        const playIfActive = () => {
            if (!active || document.visibilityState !== "visible") return;
            video.muted = true;
            const attempt = video.play();
            if (attempt) {
                attempt.catch((error: unknown) => {
                    const name = error instanceof Error ? error.name : "";
                    if (name === "NotAllowedError") setPlayback("image");
                });
            }
        };

        if (active) {
            playIfActive();
            retryTimer = window.setTimeout(playIfActive, 850);
        } else {
            video.pause();
        }

        const onPause = () => {
            if (!active || document.visibilityState !== "visible") return;
            window.setTimeout(playIfActive, 80);
        };

        const onVisibility = () => {
            if (document.visibilityState === "visible") playIfActive();
        };

        video.addEventListener("pause", onPause);
        video.addEventListener("loadeddata", playIfActive);
        video.addEventListener("canplay", playIfActive);
        document.addEventListener("visibilitychange", onVisibility);
        document.addEventListener("touchstart", playIfActive, { passive: true });
        document.addEventListener("click", playIfActive);

        return () => {
            if (retryTimer) window.clearTimeout(retryTimer);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("loadeddata", playIfActive);
            video.removeEventListener("canplay", playIfActive);
            document.removeEventListener("visibilitychange", onVisibility);
            document.removeEventListener("touchstart", playIfActive);
            document.removeEventListener("click", playIfActive);
        };
    }, [active, playback]);

    if (playback === "pending") {
        return <div className="h-full w-full bg-black" aria-hidden />;
    }

    if (playback === "image") {
        if (!keepImage && !active) {
            return <div className="h-full w-full bg-black" aria-hidden />;
        }
        return <SafariMp4Image src={src} />;
    }

    return (
        <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload={active ? "auto" : "metadata"}
            disablePictureInPicture
            disableRemotePlayback
            className="hero-clip pointer-events-none h-full w-full object-cover"
        >
            <source src={src} type="video/mp4" />
        </video>
    );
}
