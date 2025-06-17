import { useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Container, Root } from "@react-three/uikit";
import { PerspectiveCamera, OrbitControls } from "./drei-cameras";
import { Bee, calculatePlaneDimensions } from "hive-sync";

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

  const updatePlaneDimensions = () => {
    if (!meshRef.current || !camera) return;
    const { width, height } = calculatePlaneDimensions(camera, size);
    meshRef.current.geometry = new THREE.PlaneGeometry(width, height);
  };

  useEffect(() => {
    updatePlaneDimensions();
    window.addEventListener("resize", updatePlaneDimensions);
    return () => window.removeEventListener("resize", updatePlaneDimensions);
  }, [camera, size]);

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

export const Demo = () => {
  const COLOR_MAP = ["red", "green", "blue"];

  return (
    <section className="flex flex-col gap-20">
      <div className="flex flex-col gap-10">
        <h1 className="text-2xl">Demo gallery</h1>
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
        <h1 className="text-2xl">Scene gallery</h1>
        <div className="flex gap-6 items-center outline outline-dashed outline-neutral-500 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
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
          <div className="w-full h-[600px] bg-blue-800">
            <Bee className="w-full h-[200px] sticky top-6">
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshPhysicalMaterial color={COLOR_MAP[4]} />
              </mesh>
              <ambientLight intensity={1} />
              <directionalLight position={[1, 1, 1]} intensity={10} />

              <color attach="background" args={["#000"]} />
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
