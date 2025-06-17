import { Scene } from "three";

export type CanvasSize = {
  top: number;
  left: number;
  height: number;
  width: number;
};

export type Position = {
  width: number;
  height: number;
  left: number;
  top: number;
  bottom: number;
  right: number;
};

export type ContainerProps = {
  visible: boolean;
  scene: Scene;
  index: number;
  children?: React.ReactNode;
  frames: number;
  rect: React.RefObject<DOMRect>;
  track?: React.RefObject<HTMLElement>;
  canvasSize: CanvasSize;
};

export type BeeProps = {
  as?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  visible?: boolean;
  index?: number;
  frames?: number;
  children?: React.ReactNode;
  track?: React.RefObject<HTMLElement>;
};
