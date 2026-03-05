import React from "react";
import { useCurrentFrame, staticFile, Img, interpolate } from "remotion";
import { useSlideSpring, useFadeIn, useFadeOut } from "../lib/animations";
import type { ColorTheme } from "../types";

type Props = {
  productName: string;
  tagline: string;
  theme: ColorTheme;
};

export const HookScene: React.FC<Props> = ({ productName, tagline, theme }) => {
  const frame = useCurrentFrame();

  const title = useSlideSpring(0, { damping: 15, stiffness: 120 });
  const taglineOpacity = useFadeIn(15);
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
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        opacity: exitOpacity,
        position: "relative",
      }}
    >
      {/* Logo top-right */}
      <Img
        src={staticFile("branding/shop-icon.png")}
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          width: 80,
          height: 80,
          borderRadius: 16,
        }}
      />

      {/* Product name */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: theme.textOnPrimary,
          textAlign: "center",
          transform: `translateY(${title.translateY}px)`,
          opacity: title.opacity,
          maxWidth: 1400,
          lineHeight: 1.2,
        }}
      >
        {productName}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 400,
          color: theme.accent,
          marginTop: 24,
          opacity: taglineOpacity,
          textAlign: "center",
          maxWidth: 1200,
        }}
      >
        {tagline}
      </div>

      {/* Accent bar */}
      <div
        style={{
          width: 120,
          height: 4,
          backgroundColor: theme.accent,
          marginTop: 32,
          opacity: taglineOpacity,
          borderRadius: 2,
        }}
      />
    </div>
  );
};
