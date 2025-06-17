import * as React from "react";
import * as THREE from "three";
import {
  Canvas,
  context,
  createPortal,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { ContainerProps, BeeProps } from "./hive.types";
import {
  tracked,
  computeContainerPosition,
  prepareSkissor,
  clearScissor,
  PADDING,
} from "./hive-utils";

function Container({
  visible = true,
  canvasSize,
  scene,
  index,
  children,
  frames,
  rect,
  track,
}: ContainerProps) {
  const rootState = useThree();
  const [isOffscreen, setOffscreen] = React.useState(false);
  const frameCount = React.useRef(0);
  const positionRef = React.useRef<{
    position: {
      width: number;
      height: number;
      left: number;
      top: number;
      bottom: number;
      right: number;
    };
    isOffscreen: boolean;
  }>(null!);

  React.useEffect(() => {
    if (!track?.current) return;

    const updateRect = () => {
      if (track.current) {
        rect.current = track.current.getBoundingClientRect();
        // Recompute position when rect changes
        if (rect.current) {
          positionRef.current = computeContainerPosition(
            canvasSize,
            rect.current
          );
          setOffscreen(positionRef.current.isOffscreen);
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateRect);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setOffscreen(!entry.isIntersecting);
        }
      },
      { threshold: 0 }
    );

    // Add scroll listener
    window.addEventListener("scroll", updateRect, { passive: true });

    resizeObserver.observe(track.current);
    intersectionObserver.observe(track.current);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", updateRect);
    };
  }, [track, canvasSize]);

  useFrame((state) => {
    if (frames === Infinity || frameCount.current <= frames) {
      frameCount.current++;
    }
    if (rect.current && positionRef.current) {
      if (visible && !isOffscreen && rect.current) {
        const autoClear = prepareSkissor(state, positionRef.current.position);
        state.gl.render(children ? state.scene : scene, state.camera);
        clearScissor(state, autoClear);
      }
    }
  }, index);

  // connect event layer to tracked element
  React.useEffect(() => {
    if (!track) return;

    const old = rootState.get().events.connected;
    rootState.setEvents({ connected: track.current });
    return () => {
      rootState.setEvents({ connected: old });
    };
  }, [track]);

  return (
    <>
      {children}
      <group onPointerOver={() => null} />
    </>
  );
}

const CanvasView = React.forwardRef(
  (
    {
      track,
      visible = true,
      index = 1,
      id,
      style,
      className,
      frames = Infinity,
      children,
      ...props
    }: BeeProps,
    fref: React.ForwardedRef<THREE.Group>
  ) => {
    const rect = React.useRef<DOMRect>(null!);
    const { size, scene } = useThree();
    const [virtualScene] = React.useState(() => new THREE.Scene());
    const [ready, toggle] = React.useReducer(() => true, false);

    const compute = React.useCallback(
      (event: any, state: any) => {
        if (
          rect.current &&
          track &&
          track.current &&
          event.target === track.current
        ) {
          const { width, height, left, top } = rect.current;
          const x = event.clientX - left;
          const y = event.clientY - top;
          state.pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
          state.raycaster.setFromCamera(state.pointer, state.camera);
        }
      },
      [rect, track]
    );

    React.useEffect(() => {
      if (track) rect.current = track.current?.getBoundingClientRect();
      toggle();
    }, [track]);

    return (
      <group ref={fref} {...props}>
        {ready &&
          createPortal(
            <Container
              visible={visible}
              canvasSize={size}
              frames={frames}
              scene={scene}
              track={track}
              rect={rect}
              index={index}
            >
              {children}
            </Container>,
            virtualScene,
            {
              events: { compute, priority: index },
              size: {
                width: rect.current?.width,
                height: rect.current?.height,
                top: rect.current?.top,
                left: rect.current?.left,
              },
            }
          )}
      </group>
    );
  }
);

const HtmlView = React.forwardRef(
  (
    {
      as: El = "div",
      id,
      visible,
      className,
      style,
      index = 1,
      track,
      frames = Infinity,
      children,
      ...props
    }: BeeProps,
    fref: React.ForwardedRef<HTMLElement>
  ) => {
    const uuid = React.useId();
    const ref = React.useRef<HTMLElement>(null!);
    React.useImperativeHandle(fref, () => ref.current);
    return (
      <>
        {/** @ts-ignore */}
        <El ref={ref} id={id} className={className} style={style} {...props} />
        <tracked.In>
          <CanvasView
            visible={visible}
            key={uuid}
            track={ref}
            frames={frames}
            index={index}
          >
            {children}
          </CanvasView>
        </tracked.In>
      </>
    );
  }
);

export type ViewportProps = {
  Pollen: () => React.JSX.Element;
} & React.ForwardRefExoticComponent<
  BeeProps & React.RefAttributes<HTMLElement | THREE.Group>
>;

export const Bee = (() => {
  const _Bee = React.forwardRef(
    (props: BeeProps, fref: React.ForwardedRef<HTMLElement | THREE.Group>) => {
      const store = React.useContext(context);
      if (!store)
        return (
          <HtmlView
            ref={fref as unknown as React.ForwardedRef<HTMLElement>}
            {...props}
          />
        );

      return (
        <CanvasView
          ref={fref as unknown as React.ForwardedRef<THREE.Group>}
          {...props}
        />
      );
    }
  ) as ViewportProps;

  _Bee.Pollen = () => <tracked.Out />;

  return _Bee;
})();

export const Hive = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  useScrollUpdate(wrapperRef);

  return (
    <div
      ref={wrapperRef}
      style={
        {
          "--height-offset": 1 + PADDING * 2,
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          overflow: "hidden",
          willChange: "transform",
          pointerEvents: "none",
          height: "calc(100lvh * var(--height-offset))",
          width: "100%",
        } as React.CSSProperties
      }
    >
      <Canvas eventSource={containerRef}>
        <Bee.Pollen />
      </Canvas>
    </div>
  );
};

import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";

export const useScrollUpdate = (
  wrapperRef: RefObject<HTMLDivElement | null>
) => {
  const scrollOffset = useRef({ x: 0, y: 0 });

  const updateScroll = useCallback(() => {
    if (!wrapperRef.current) return;

    scrollOffset.current.x = window.scrollX;
    scrollOffset.current.y = window.scrollY - window.innerHeight * PADDING;

    wrapperRef.current.style.transform = `translate3d(${scrollOffset.current.x}px, ${scrollOffset.current.y}px, 0)`;
  }, [wrapperRef]);

  useEffect(() => {
    window.addEventListener("scroll", updateScroll, {
      passive: true,
    });
    updateScroll();

    return () => window.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);
};
