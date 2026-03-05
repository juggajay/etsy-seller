import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { useFadeOut } from "../lib/animations";
import type { ColorTheme } from "../types";

type Props = {
  features: string[];
  theme: ColorTheme;
};

export const FeaturesScene: React.FC<Props> = ({ features, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = useFadeOut(70, 19);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.primary,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 200,
        fontFamily: "Inter, sans-serif",
        opacity: exitOpacity,
      }}
    >
      {/* Section title */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: theme.accent,
          marginBottom: 48,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        What's Included
      </div>

      {features.map((feature, i) => {
        const delay = i * 18;

        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 15, stiffness: 120 },
        });

        const translateX = interpolate(progress, [0, 1], [60, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 28,
              transform: `translateX(${translateX}px)`,
              opacity,
            }}
          >
            {/* Accent bar */}
            <div
              style={{
                width: 6,
                height: 36,
                backgroundColor: theme.accent,
                borderRadius: 3,
                marginRight: 24,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: theme.textOnPrimary,
              }}
            >
              {feature}
            </div>
          </div>
        );
      })}
    </div>
  );
};
