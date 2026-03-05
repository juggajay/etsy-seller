import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const useFadeIn = (startFrame: number, duration = 15) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const useFadeOut = (startFrame: number, duration = 15) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const useSlideSpring = (delay = 0, config?: { damping?: number; stiffness?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: config?.damping ?? 15,
      stiffness: config?.stiffness ?? 120,
    },
  });

  return {
    translateY: interpolate(progress, [0, 1], [40, 0]),
    translateX: interpolate(progress, [0, 1], [60, 0]),
    opacity: interpolate(progress, [0, 1], [0, 1]),
    scale: interpolate(progress, [0, 1], [0.8, 1]),
    progress,
  };
};

export const useScaleSpring = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return {
    scale: interpolate(progress, [0, 1], [0, 1]),
    opacity: interpolate(progress, [0, 1], [0, 1]),
    progress,
  };
};
