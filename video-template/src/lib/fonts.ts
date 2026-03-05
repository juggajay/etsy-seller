import { staticFile } from "remotion";

export const loadFont = () => {
  const interRegular = new FontFace("Inter", `url(${staticFile("fonts/Inter-Regular.ttf")})`);
  const interBold = new FontFace("Inter", `url(${staticFile("fonts/Inter-Bold.ttf")})`, { weight: "700" });
  const interMedium = new FontFace("Inter", `url(${staticFile("fonts/Inter-Medium.ttf")})`, { weight: "500" });

  return Promise.all([interRegular.load(), interBold.load(), interMedium.load()]).then((fonts) => {
    fonts.forEach((f) => document.fonts.add(f));
  });
};
