import { Composition, Folder } from "remotion";
import { BlunderLabDemo, type BlunderLabDemoProps } from "./BlunderLabDemo";
import {
  VIDEO_FPS,
  VIDEO_FRAMES,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "./data/demoGame";
import "./styles.css";

const defaultEnglishProps = {
  locale: "en",
} satisfies BlunderLabDemoProps;

const defaultRussianProps = {
  locale: "ru",
} satisfies BlunderLabDemoProps;

export function RemotionRoot() {
  return (
    <Folder name="BlunderLab">
      <Composition
        id="BlunderLabDemo"
        component={BlunderLabDemo}
        durationInFrames={VIDEO_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultEnglishProps}
      />
      <Composition
        id="BlunderLabDemoEN"
        component={BlunderLabDemo}
        durationInFrames={VIDEO_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultEnglishProps}
      />
      <Composition
        id="BlunderLabDemoRU"
        component={BlunderLabDemo}
        durationInFrames={VIDEO_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultRussianProps}
      />
    </Folder>
  );
}
