import tunnel from "tunnel-rat";
import { RootState } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasSize } from "./hive.types";

export const isOrthographicCamera = (
  def: any
): def is THREE.OrthographicCamera =>
  def && (def as THREE.OrthographicCamera).isOrthographicCamera;
export const col = new THREE.Color();
export const tracked = tunnel();
export const PADDING = 0.25;

export const computeContainerPosition = (
  canvasSize: CanvasSize,
  trackRect: DOMRect
) => {
  const {
    right,
    top,
    left: trackLeft,
    bottom: trackBottom,
    width,
    height,
  } = trackRect;
  // scroll offset w/ padding
  const scrollOffset = window.scrollY - window.innerHeight * PADDING;
  const viewportHeight = window.innerHeight * (1 + PADDING * 2);

  const canvasBottom = canvasSize.top + canvasSize.height;
  const bottom = canvasBottom - trackBottom;
  const left = trackLeft - canvasSize.left;

  // calculate element position relative to the scroll
  const elementTop = top + window.scrollY;
  const elementBottom = trackBottom + window.scrollY;

  // check if element is within the extended viewport
  const isOffscreen =
    elementBottom < scrollOffset - viewportHeight * 0.5 ||
    elementTop > scrollOffset + viewportHeight * 1.5 ||
    right < 0 ||
    trackRect.left > canvasSize.width;

  return { position: { width, height, left, top, bottom, right }, isOffscreen };
};

export const prepareSkissor = (
  state: RootState,
  {
    left,
    bottom,
    width,
    height,
  }: {
    width: number;
    height: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  }
) => {
  let autoClear;
  const aspect = width / height;
  if (isOrthographicCamera(state.camera)) {
    if (!state.camera.manual) {
      if (
        state.camera.left !== width / -2 ||
        state.camera.right !== width / 2 ||
        state.camera.top !== height / 2 ||
        state.camera.bottom !== height / -2
      ) {
        Object.assign(state.camera, {
          left: width / -2,
          right: width / 2,
          top: height / 2,
          bottom: height / -2,
        });
        state.camera.updateProjectionMatrix();
      }
    } else {
      state.camera.updateProjectionMatrix();
    }
  } else if (state.camera.aspect !== aspect) {
    state.camera.aspect = aspect;
    state.camera.updateProjectionMatrix();
  }
  autoClear = state.gl.autoClear;
  state.gl.autoClear = false;
  state.gl.setViewport(left, bottom, width, height);
  state.gl.setScissor(left, bottom, width, height);
  state.gl.setScissorTest(true);
  return autoClear;
};

export const clearScissor = (state: RootState, autoClear: boolean) => {
  state.gl.setScissorTest(false);
  state.gl.autoClear = autoClear;
};

export const clear = (state: RootState) => {
  state.gl.getClearColor(col);
  state.gl.setClearColor(col, state.gl.getClearAlpha());
  state.gl.clear(true, true);
};

export const calculatePlaneDimensions = (
  camera: THREE.Camera,
  viewportSize: { width: number; height: number }
): { width: number; height: number } => {
  if (!(camera instanceof THREE.PerspectiveCamera)) {
    throw new Error("Camera must be a PerspectiveCamera");
  }

  const fov = camera.fov * (Math.PI / 180);
  const distance = Math.abs(camera.position.z);

  const height = 2 * Math.tan(fov / 2) * distance;
  const width = height * (viewportSize.width / viewportSize.height);

  return { width, height };
};
