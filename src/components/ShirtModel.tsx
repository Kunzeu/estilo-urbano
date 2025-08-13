import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Decal } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface ShirtModelProps {
  color: string;
  logoUrl?: string | null;
}

function ShirtMesh({ color, logoUrl }: ShirtModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF('/models/shirt_baked.glb');
  const shirt = gltf.scene;

  // Depuración: imprimir materiales y meshes
  shirt.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh && (obj as THREE.Mesh).material) {
      const material = (obj as THREE.Mesh).material;
      if (Array.isArray(material)) {
        material.forEach(mat => {
          console.log('Material encontrado:', mat.name);
        });
      } else {
        console.log('Material encontrado:', material.name);
      }
    }
  });

  // Cambiar el color del material principal de forma segura
  shirt.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh && (obj as THREE.Mesh).material) {
      const material = (obj as THREE.Mesh).material;
      if (Array.isArray(material)) {
        material.forEach((mat, index) => {
          if (mat.name === 'lambert1' && 'color' in mat) {
            // Clonar el material para no corromper el original
            const clonedMaterial = mat.clone();
            (clonedMaterial as THREE.Material & { color: THREE.Color }).color.set(color);
            material[index] = clonedMaterial;
            console.log('Color aplicado a material clonado:', mat.name, color);
          }
        });
      } else if (material.name === 'lambert1' && 'color' in material) {
        // Clonar el material para no corromper el original
        const clonedMaterial = material.clone();
        (clonedMaterial as THREE.Material & { color: THREE.Color }).color.set(color);
        (obj as THREE.Mesh).material = clonedMaterial;
        console.log('Color aplicado a material clonado:', material.name, color);
      }
    }
  });

  // Cargar la textura del logo solo una vez
  const logoTexture = useTexture(logoUrl && logoUrl.trim() !== '' ? logoUrl : '/models/white.png');

  // Renderizar el modelo y el Decal directamente dentro del mesh correcto
  const meshes: React.ReactNode[] = [];
  shirt.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh && (obj as THREE.Mesh).material) {
      const material = (obj as THREE.Mesh).material;
      if ((Array.isArray(material) && material.some(mat => mat.name === 'lambert1')) || (!Array.isArray(material) && material.name === 'lambert1')) {
        meshes.push(
          <primitive object={obj} key={obj.uuid}>
            {logoUrl && logoUrl.trim() !== '' && (
              <Decal
                position={[0, 0.6, 0.18]}
                rotation={[0, 0, 0]}
                scale={0.8}
                map={logoTexture}
              />
            )}
          </primitive>
        );
      } else {
        meshes.push(<primitive object={obj} key={obj.uuid} />);
      }
    }
  });

  return (
    <group ref={group} dispose={null}>
      {meshes}
    </group>
  );
}

export default function ShirtModel({ color, logoUrl }: ShirtModelProps) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <Canvas camera={{ position: [0, 0, 2.2], fov: 40 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <ShirtMesh color={color} logoUrl={logoUrl} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/shirt_baked.glb'); 