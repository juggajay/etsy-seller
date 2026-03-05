import React, { useEffect } from "react";
import { Sequence, AbsoluteFill } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { CarouselScene } from "./scenes/CarouselScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CtaScene } from "./scenes/CtaScene";
import { loadFont } from "./lib/fonts";
import type { ProductVideoProps } from "./types";

export const ProductVideo: React.FC<ProductVideoProps> = ({
  productName,
  tagline,
  colorTheme,
  screenshots,
  features,
}) => {
  useEffect(() => {
    loadFont();
  }, []);

  return (
    <AbsoluteFill>
      {/* Scene 1: Hook — frames 0-89 (3s) */}
      <Sequence from={0} durationInFrames={90}>
        <HookScene productName={productName} tagline={tagline} theme={colorTheme} />
      </Sequence>

      {/* Scene 2: Screenshot Carousel — frames 90-269 (6s) */}
      <Sequence from={90} durationInFrames={180}>
        <CarouselScene screenshots={screenshots} theme={colorTheme} />
      </Sequence>

      {/* Scene 3: Features — frames 270-359 (3s) */}
      <Sequence from={270} durationInFrames={90}>
        <FeaturesScene features={features} theme={colorTheme} />
      </Sequence>

      {/* Scene 4: CTA — frames 360-449 (3s) */}
      <Sequence from={360} durationInFrames={90}>
        <CtaScene theme={colorTheme} />
      </Sequence>
    </AbsoluteFill>
  );
};
