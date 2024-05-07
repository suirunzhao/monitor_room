import { Canvas, useFrame } from '@react-three/fiber'
import React, { Suspense, useRef, useState } from 'react';
import { useGLTF, MeshReflectorMaterial, BakeShadows, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing'
import { easing } from 'maath'
import { suspend } from 'suspend-react'
import { Instances, Computers } from './Computers'
import { Model } from './Model';


export default function App() {
  const ref = useRef();

  const rows = 6;
  const columns = 15;
  const spacing = 1.5;
  // Calculate the center offset
  const offsetX = (columns - 1) * spacing / 2;
  const offsetY = (rows - 1) * spacing / 2;
  
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [-1.5, 1, 5.5], fov: 45, near: 1, far: 20 }} eventSource={document.getElementById('root')} eventPrefix="client">
      {/* Lights */}
      <color attach="background" args={['black']} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
      {/* Main scene */}
      <group position={[-0, -2.5, 0]}>
        {/* Auto-instanced sketchfab model */}
        <Instances>
          <Computers scale={0.7} />
        </Instances>
        {/* Plane reflections + distance blur */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 30]}
            resolution={2048}
            mixBlur={1}
            mixStrength={180}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#202020"
            metalness={0.8}
          />
        </mesh>
      </group>
      {/* Postprocessing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={3} />
        <DepthOfField target={[0, 0, 16]} focalLength={0.3} bokehScale={5} height={700} />
      </EffectComposer>
      {/* Camera movements */}
      <CameraRig />
      {/* Small helper that freezes the shadows for better performance */}
      <BakeShadows />
      <Suspense fallback={null}>
        {/* Remove Stage and manually set lighting and environment */}
        {Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: columns }, (_, columnIndex) => (
            <Model
              key={`${rowIndex}-${columnIndex}`}
              // Adjust each model's position to center the grid
              position={[
                columnIndex * spacing - offsetX,
                rowIndex * spacing - offsetY,
                -5
              ]}
            />
          ))
        )}
      </Suspense>
      <OrbitControls ref={ref} />
    </Canvas>
  )
}

function CameraRig() {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0 + (state.pointer.x * state.viewport.width) / 3, (1 + state.pointer.y) / 2, 5.5], 0.5, delta)
    state.camera.lookAt(0, 0, 0)
  })
}
