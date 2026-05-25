// Allow importing SVGs as React components via react-native-svg-transformer.
declare module "*.svg" {
  import type { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
