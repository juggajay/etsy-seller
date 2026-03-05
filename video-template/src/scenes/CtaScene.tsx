import React from "react";
import { staticFile, Img } from "remotion";
import { useScaleSpring, useFadeIn } from "../lib/animations";
import type { ColorTheme } from "../types";

type Props = {
  theme: ColorTheme;
};

export const CtaScene: React.FC<Props> = ({ theme }) => {
  const logo = useScaleSpring(0);
  const line1Opacity = useFadeIn(12);
  const line2Opacity = useFadeIn(24);
  const line3Opacity = useFadeIn(36);

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
      }}
    >
      {/* Logo */}
      <Img
        src={staticFile("branding/shop-icon.png")}
        style={{
          width: 160,
          height: 160,
          borderRadius: 32,
          transform: `scale(${logo.scale})`,
          opacity: logo.opacity,
          marginBottom: 40,
        }}
      />

      {/* CTA text */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: theme.textOnPrimary,
          opacity: line1Opacity,
          marginBottom: 16,
        }}
      >
        Instant Download
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 400,
          color: theme.accent,
          opacity: line2Opacity,
          marginBottom: 32,
        }}
      >
        Available Now on Etsy
      </div>

      {/* Shop name */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: theme.textOnPrimary,
          opacity: line3Opacity,
          letterSpacing: 2,
        }}
      >
        FileSmartCo
      </div>
    </div>
  );
};
