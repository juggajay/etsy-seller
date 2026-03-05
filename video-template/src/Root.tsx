import React from "react";
import { Composition } from "remotion";
import { ProductVideo } from "./ProductVideo";
import type { ProductVideoProps } from "./types";
import { THEMES } from "./lib/themes";

const defaultProps: ProductVideoProps = {
  productName: "Budget Planner\nSpreadsheet",
  tagline: "Track income, expenses & savings in one place",
  colorTheme: THEMES.navy,
  screenshots: [
    "screenshot-01.jpg",
    "screenshot-02.jpg",
    "screenshot-03.jpg",
    "screenshot-04.jpg",
  ],
  features: [
    "Monthly & yearly budget views",
    "Auto-calculating formulas",
    "4 professional colour themes",
    "Works in Excel & Google Sheets",
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ProductVideo"
      component={ProductVideo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  );
};
