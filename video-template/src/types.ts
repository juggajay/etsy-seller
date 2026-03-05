export type ColorTheme = {
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
};

export type ProductVideoProps = {
  productName: string;
  tagline: string;
  colorTheme: ColorTheme;
  screenshots: string[];
  features: string[];
};
