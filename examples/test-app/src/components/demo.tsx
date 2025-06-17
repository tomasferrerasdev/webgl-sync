import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { Container, Root } from "@react-three/uikit";
import { PerspectiveCamera, OrbitControls } from "./drei-cameras";
import { Bee, calculatePlaneDimensions } from "hive-sync";

const COLOR_MAP = ["red", "green", "blue"];

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
  }
`;

const Plane = () => {
  const { camera, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  const updatePlaneDimensions = useCallback(() => {
    if (!meshRef.current || !camera) return;
    const { width, height } = calculatePlaneDimensions(camera, size);
    meshRef.current.geometry = new THREE.PlaneGeometry(width, height);
  }, [camera, size]);

  useEffect(() => {
    updatePlaneDimensions();
    window.addEventListener("resize", updatePlaneDimensions);
    return () => window.removeEventListener("resize", updatePlaneDimensions);
  }, [updatePlaneDimensions]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

const UiKitLayout = () => {
  const { camera, size } = useThree();
  const { width, height } = calculatePlaneDimensions(camera, size);

  return (
    <Root
      backgroundColor="red"
      sizeX={width}
      sizeY={height}
      flexDirection="row"
      padding={10}
    >
      <Container flexGrow={1} margin={40} backgroundColor="green" />
      <Container flexGrow={1} margin={40} backgroundColor="blue" />
    </Root>
  );
};

const useScroll = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
};

const ScrollRotation = () => {
  const scrollY = useScroll();
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (meshRef.current) {
      targetRotation.current.x = scrollY * 0.01;
      targetRotation.current.y = scrollY * 0.01;
    }
  }, [scrollY]);

  useFrame(() => {
    if (meshRef.current) {
      // Lerp the current rotation towards the target rotation
      currentRotation.current.x +=
        (targetRotation.current.x - currentRotation.current.x) * 0.01;
      currentRotation.current.y +=
        (targetRotation.current.y - currentRotation.current.y) * 0.01;

      meshRef.current.rotation.x = currentRotation.current.x;
      meshRef.current.rotation.y = currentRotation.current.y;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshPhysicalMaterial color={COLOR_MAP[0]} />
    </mesh>
  );
};

export const Demo = () => {
  return (
    <section className="flex flex-col gap-20">
      <div className="flex flex-col gap-10">
        <h1 className="text-2xl">Hive basic</h1>
        <div className="flex gap-6 items-center outline outline-dashed outline-neutral-500 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full h-[600px] bg-blue-800">
              <Bee className="w-full h-[600px]">
                <Plane />
              </Bee>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <h1 className="text-2xl">Hive grid</h1>
        <div className="flex gap-6 items-center outline outline-dashed outline-neutral-500 p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full h-[600px] bg-blue-800">
              <Bee className="w-full h-[600px]">
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshPhysicalMaterial color={COLOR_MAP[index]} />
                </mesh>
                <OrbitControls />
                <directionalLight position={[1, 1, 1]} intensity={10} />
                <PerspectiveCamera position={[0, 0, 5]} makeDefault />
                <ambientLight intensity={1} />
                <color attach="background" args={["#000"]} />
              </Bee>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <h1 className="text-2xl">Hive sticky</h1>
        <div className="h-[200vh] outline outline-dashed outline-neutral-500 p-6">
          <div className="w-[400px] h-[400px] sticky top-6 left-1/2 -translate-x-1/2 border border-dashed border-neutral-500 rounded-sm">
            <p className="bg-neutral-500 text-white px-0.5 py-px w-fit absolute top-0 left-0">
              sticky
            </p>
            <Bee className="w-[400px] h-[400px]">
              <directionalLight position={[1, 1, 1]} intensity={10} />
              <PerspectiveCamera position={[0, 0, 5]} makeDefault />
              <ambientLight intensity={1} />
              <ScrollRotation />
            </Bee>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <h1 className="text-2xl">UIKit gallery</h1>
        <div className="outline outline-dashed outline-neutral-500 p-6">
          <Bee className="h-[300px] w-[500px] bg-red-300">
            <UiKitLayout />
            <PerspectiveCamera position={[0, 0, 5]} makeDefault />
            <OrbitControls />
          </Bee>
        </div>
      </div>
    </section>
  );
};
