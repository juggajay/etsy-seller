import React from "react";
import { useCurrentFrame, useVideoConfig, staticFile, Img, interpolate, spring } from "remotion";
import type { ColorTheme } from "../types";

type Props = {
  screenshots: string[];
  theme: ColorTheme;
};

export const CarouselScene: React.FC<Props> = ({ screenshots, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DURATION = 180; // total frames for this scene
  const count = screenshots.length;
  const framePer = DURATION / count;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.secondary,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {screenshots.map((src, i) => {
        const start = i * framePer;
        const end = start + framePer;

        // Fade in over first 15 frames of this screenshot's slot
        const fadeIn = interpolate(frame, [start, start + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Fade out over last 15 frames (except last screenshot)
        const fadeOut =
          i < count - 1
            ? interpolate(frame, [end - 15, end], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

        // Scale spring on entrance
        const scaleProgress = spring({
          frame: frame - start,
          fps,
          config: { damping: 18, stiffness: 80 },
        });
        const scale = interpolate(scaleProgress, [0, 1], [0.95, 1]);

        const opacity = fadeIn * fadeOut;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 1600,
              height: 900,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              opacity,
              transform: `scale(${scale})`,
            }}
          >
            <Img
              src={staticFile(`screenshots/${src}`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
