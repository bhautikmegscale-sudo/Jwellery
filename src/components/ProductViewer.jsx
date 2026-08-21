







"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useLoader, useThree, createPortal } from '@react-three/fiber';
import { OrbitControls, Center, Environment, MeshRefractionMaterial, Bvh, ContactShadows } from '@react-three/drei';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { CanvasTexture, TextureLoader, EquirectangularReflectionMapping, Color, DoubleSide, MeshStandardMaterial, MeshPhysicalMaterial, ACESFilmicToneMapping, Box3, Vector3 } from 'three';

// Monkey patch FBXLoader to prevent crash on FBX files with missing/undefined filenames or texture references.
if (FBXLoader && FBXLoader.prototype) {
  const originalParse = FBXLoader.prototype.parse;
  FBXLoader.prototype.parse = function (FBXBuffer, path) {
    const propsToPatch = ['RelativeFilename', 'Filename', 'FileName'];
    const originalDescriptors = {};

    propsToPatch.forEach((prop) => {
      if (prop in Object.prototype) {
        originalDescriptors[prop] = Object.getOwnPropertyDescriptor(Object.prototype, prop);
      }

      Object.defineProperty(Object.prototype, prop, {
        get() {
          return '';
        },
        set(val) {
          Object.defineProperty(this, prop, {
            value: val,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        },
        configurable: true,
      });
    });

    try {
      return originalParse.call(this, FBXBuffer, path);
    } finally {
      // Restore Object.prototype to original state
      propsToPatch.forEach((prop) => {
        delete Object.prototype[prop];
        if (originalDescriptors[prop]) {
          Object.defineProperty(Object.prototype, prop, originalDescriptors[prop]);
        }
      });
    }
  };
}

// Helper to deduce format from path/name if not explicitly set
function getFileFormat(url) {
  if (!url) return 'gltf';
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  if (cleanUrl.endsWith('.fbx')) return 'fbx';
  if (cleanUrl.endsWith('.obj')) return 'obj';
  if (cleanUrl.endsWith('.stl')) return 'stl';
  if (cleanUrl.endsWith('.ply')) return 'ply';
  return 'gltf';
}

// Dynamically Loads User's GLTF/GLB/FBX/OBJ/STL/PLY model from Blob URL or manual path
let studioEnvMapInstance = null;
const getStudioEnvMap = () => {
  if (studioEnvMapInstance) return studioEnvMapInstance;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Balanced dark grey background for contrast without being overly black
  ctx.fillStyle = '#1b1b1c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw 8 symmetric, wide studio lights for bright, glowing highlights
  for (let i = 0; i < 8; i++) {
    const startX = i * 256;

    // 1. Softbox edge (grey) - much wider now (50% of the segment)
    ctx.fillStyle = '#808088';
    ctx.fillRect(startX + 64, 0, 128, 1024);

    // 2. Bright white center for intense highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX + 88, 0, 80, 1024);
  }

  // Add symmetric horizontal bands
  ctx.fillStyle = '#808088';
  ctx.fillRect(0, 256, 2048, 80);
  ctx.fillRect(0, 768, 2048, 80);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 276, 2048, 40);
  ctx.fillRect(0, 788, 2048, 40);

  const texture = new CanvasTexture(canvas);
  texture.mapping = EquirectangularReflectionMapping;
  studioEnvMapInstance = texture;
  return texture;
};

let diamondEnvMapInstance = null;
const getDiamondEnvMap = () => {
  if (diamondEnvMapInstance) return diamondEnvMapInstance;

  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Lighter grey background to significantly reduce black shadows inside the diamond
  ctx.fillStyle = '#4c4c4dff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw perfectly symmetric studio lights around the 360 environment (8 segments)
  for (let i = 0; i < 8; i++) {
    const startX = i * 512;
    ctx.fillStyle = '#9292a1ff';
    ctx.fillRect(startX + 56, 0, 400, 2048);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX + 136, 0, 240, 2048);
  }

  // Add symmetric horizontal bands
  ctx.fillStyle = '#afafb3ff';
  ctx.fillRect(0, 512, 4096, 160);
  ctx.fillRect(0, 1536, 4096, 160);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 552, 4096, 80);
  ctx.fillRect(0, 1576, 4096, 80);

  // Soft white caps to prevent completely black top/bottom holes
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, 4096, 120);
  ctx.fillRect(0, 1928, 4096, 120);

  const texture = new CanvasTexture(canvas);
  texture.mapping = EquirectangularReflectionMapping;
  diamondEnvMapInstance = texture;
  return texture;
};

// Dynamically Loads User's GLTF/GLB/FBX/OBJ/STL/PLY model from Blob URL or manual path
function UploadedModel({ url, format, envMap, diamondEnvMap }) {
  const fmt = format || getFileFormat(url);

  // Select appropriate loader
  let loaderClass = GLTFLoader;
  if (fmt === 'fbx') loaderClass = FBXLoader;
  else if (fmt === 'obj') loaderClass = OBJLoader;
  else if (fmt === 'stl') loaderClass = STLLoader;
  else if (fmt === 'ply') loaderClass = PLYLoader;

  const result = useLoader(loaderClass, url);

  const { renderObject, diamonds, scaleFactor } = React.useMemo(() => {
    // Traverse and configure high-fidelity rendering settings for materials
    // Clone the scene to avoid modifying the cached result from useLoader
    const object = result.scene ? result.scene.clone() : result.clone();
    const list = [];
    let targetScale = 1;

    if (object && typeof object.traverse === 'function') {
      // Auto-scale model so its maximum dimension is exactly 1.0 unit (normalizes mm, cm, m exports)
      const box = new Box3().setFromObject(object);
      const size = new Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        targetScale = 1.0 / maxDim;
        console.log(`[3D AutoScale] Original Max Dim: ${maxDim} | Scaling factor: ${targetScale}`);
      }

      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            let isDiamondMesh = false;

            materials.forEach((mat, idx) => {
              const matName = (mat.name || '').toLowerCase();
              const meshName = (child.name || '').toLowerCase();

              // Check if the material is physically colorless/white (typical for diamonds)
              const isColorless = mat.color && (mat.color.r > 0.8 && mat.color.g > 0.8 && mat.color.b > 0.8);
              const hasMetalKeywords = (
                matName.includes('metal') || matName.includes('gold') || matName.includes('rose') || matName.includes('plat') || matName.includes('silver') || matName.includes('band') || matName.includes('prong') || matName.includes('shank') || matName.includes('setting') || matName.includes('head') || matName.includes('bezel') ||
                meshName.includes('metal') || meshName.includes('gold') || meshName.includes('rose') || meshName.includes('plat') || meshName.includes('silver') || meshName.includes('band') || meshName.includes('prong') || meshName.includes('shank') || meshName.includes('setting') || meshName.includes('head') || meshName.includes('bezel')
              );

              // 1. Detect Diamond/Gemstone: by material name, mesh name, or physical properties
              const isDiamond = (
                matName.includes('diamond') ||
                matName.includes('gem') ||
                matName.includes('stone') ||
                matName.includes('brilliant') ||
                matName.includes('crystal') ||
                matName.includes('glass') ||
                matName.includes('refract') ||
                matName.includes('jewel') ||
                matName.includes('sapphire') ||
                matName.includes('ruby') ||
                matName.includes('emerald') ||
                matName.includes('brulik') ||
                matName.includes('baguette') ||
                matName.includes('baguete') ||
                matName.includes('baguet') ||
                matName.includes('cut') ||
                matName.includes('facet') ||
                matName.includes('cz') ||
                matName.includes('zircon') ||
                matName.includes('zirconia') ||
                matName.includes('moissanite') ||
                matName.includes('melee') ||
                meshName.includes('diamond') ||
                meshName.includes('gem') ||
                meshName.includes('stone') ||
                meshName.includes('brilliant') ||
                meshName.includes('crystal') ||
                meshName.includes('glass') ||
                meshName.includes('refract') ||
                meshName.includes('jewel') ||
                meshName.includes('sapphire') ||
                meshName.includes('ruby') ||
                meshName.includes('emerald') ||
                meshName.includes('brulik') ||
                meshName.includes('baguette') ||
                meshName.includes('baguete') ||
                meshName.includes('baguet') ||
                meshName.includes('cut') ||
                meshName.includes('facet') ||
                meshName.includes('cz') ||
                meshName.includes('zircon') ||
                meshName.includes('zirconia') ||
                meshName.includes('moissanite') ||
                meshName.includes('melee') ||
                mat.transmission > 0.1 ||
                mat.transparent === true ||
                (mat.opacity !== undefined && mat.opacity < 1.0) ||
                (isColorless && !hasMetalKeywords) // Smart heuristic for generic diamond names
              );

              console.log(`[3D Loader] Mesh: "${child.name}" | Material: "${mat.name}" | Is Diamond: ${isDiamond}`);

              if (isDiamond) {
                isDiamondMesh = true;
              } else {
                // Keep original metal material but tweak roughness to soften harsh black shadows
                if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                  mat.roughness = Math.max(mat.roughness || 0, 0.12);
                  mat.envMapIntensity = Math.max(mat.envMapIntensity || 1, 2.5);
                }
              }
            });

            if (isDiamondMesh) {
              child.castShadow = false;
              child.receiveShadow = false;
              list.push(child);
            }
          }
        }
      });
    }
    return { renderObject: object, diamonds: list, scaleFactor: targetScale };
  }, [result]);

  // If geometry format (STL / PLY), wrap it in a mesh with default standard material
  if (fmt === 'stl' || fmt === 'ply') {
    return (
      <mesh geometry={result} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#d4af37" // Beautiful default gold for untextured STL/PLY geometry
          metalness={1.0}
          roughness={0.08}
          envMapIntensity={3.5}
        />
      </mesh>
    );
  }

  return (
    <>
      <group scale={scaleFactor}>
        <primitive object={renderObject} />
      </group>
      {diamonds.map((mesh) => {
        const matColor = Array.isArray(mesh.material) ? mesh.material[0]?.color : mesh.material?.color;
        return createPortal(
          <MeshRefractionMaterial
            key={mesh.uuid}
            envMap={diamondEnvMap || envMap}
            bounces={4}                                       // Standard bounces
            ior={2.4}                                         // Standard diamond IOR
            color={matColor || "#ffffff"}
            aberrationStrength={0.002}                         // Minor, realistic RGB shades on facet borders
            fresnel={0.8}                                     // Standard fresnel
            toneMapped={true}                                 // Keeping tone mapping on to prevent pure white blowouts
            fastChroma={true}                                 // fastChroma gives the crisp RGB border effect
          />,
          mesh
        );
      })}
    </>
  );
}

// Fixed Tone Mapping & Exposure Manager
function SceneController() {
  const { gl, scene } = useThree();
  useEffect(() => {
    // Enable photographic ACES Filmic tone mapping
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.95; // Reduced to prevent highlight overexposure and blurry haze
    // Set global environment intensity to a balanced physical level
    scene.environmentIntensity = 0.9; // Slightly reduced to keep reflection highlights crisp
    // Set solid background matching container
    scene.background = new Color('#f8fafc');
  }, [gl, scene]);
  return null;
}

// Component to render environment & model when a custom HDR/EXR is uploaded
function CustomHdrScene({ url, type, uploadedModel, modelError, setModelError }) {
  const isExr = type === 'exr' || url.toLowerCase().endsWith('.exr') || url.includes('.exr');
  const isHdr = type === 'hdr' || url.toLowerCase().endsWith('.hdr') || url.includes('.hdr');

  const loader = isExr ? EXRLoader : (isHdr ? RGBELoader : TextureLoader);
  const texture = useLoader(loader, url);

  useEffect(() => {
    if (texture) {
      texture.mapping = EquirectangularReflectionMapping;
    }
  }, [texture]);

  return (
    <>
      <Environment map={texture} background={false} />
      <Bvh>
        <group>
          <Center>
            {uploadedModel?.url && !modelError ? (
              <ErrorBoundary onError={() => setModelError(true)}>
                <UploadedModel
                  url={uploadedModel.url}
                  format={uploadedModel.format}
                  envMap={texture}
                />
              </ErrorBoundary>
            ) : null}
          </Center>
        </group>
      </Bvh>
    </>
  );
}

// Component to render environment & model using procedural high-contrast studio map by default
function DefaultStudioScene({ uploadedModel, modelError, setModelError }) {
  const studioEnvMap = getStudioEnvMap();
  const diamondEnvMap = getDiamondEnvMap();

  return (
    <>
      <Environment map={studioEnvMap} background={false} />
      <Bvh>
        <group>
          <Center>
            {uploadedModel?.url && !modelError ? (
              <ErrorBoundary onError={() => setModelError(true)}>
                <UploadedModel
                  url={uploadedModel.url}
                  format={uploadedModel.format}
                  envMap={studioEnvMap}
                  diamondEnvMap={diamondEnvMap}
                />
              </ErrorBoundary>
            ) : null}
          </Center>
        </group>
      </Bvh>
    </>
  );
}

export default function ProductViewer({ uploadedModel, uploadedHdr, isThumbnail = false }) {
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    setModelError(false);
  }, [uploadedModel?.url]);

  return (
    <div className="product-viewer-container" style={{ width: '100%', height: '100%', minHeight: isThumbnail ? '100%' : '500px' }}>
      <Canvas
        camera={{ position: [0, 1.2, 3.0], fov: 45 }}
        gl={{ antialias: true }}
      >
        <SceneController />

        {/* Soft contact shadows below the ring for realistic grounding */}
        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.35}
          scale={4.0}
          blur={1.5}
          far={1.2}
          color="#000000"
        />

        {/* Subtle Ambient base lighting to fill dark shadow areas realistically */}
        <ambientLight intensity={0.5} />

        {/* Primary Key Light from top-front-right */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.6}
        />

        {/* Subtle Fill Light from left to soften shadows */}
        <directionalLight
          position={[-5, 4, 2]}
          intensity={0.4}
        />

        {/* Back Light to separate ring from the background */}
        <directionalLight
          position={[-3, 6, -5]}
          intensity={0.15}
        />

        <OrbitControls
          enablePan={!isThumbnail}
          enableZoom={!isThumbnail}
          minDistance={1}
          maxDistance={2.8}
          minPolarAngle={Math.PI / 6} // Stops rotation right at this tilted top view
          maxPolarAngle={Math.PI / 2 + 0.05} // Prevent rotating underneath the ring
          autoRotate={true}
          autoRotateSpeed={isThumbnail ? 2 : 1}
          makeDefault
        />

        {/* Environment & 3D Model Setup */}
        {uploadedHdr?.url ? (
          <Suspense fallback={null}>
            <CustomHdrScene
              url={uploadedHdr.url}
              type={uploadedHdr.type}
              uploadedModel={uploadedModel}
              modelError={modelError}
              setModelError={setModelError}
            />
          </Suspense>
        ) : (
          <Suspense fallback={null}>
            <DefaultStudioScene
              uploadedModel={uploadedModel}
              modelError={modelError}
              setModelError={setModelError}
            />
          </Suspense>
        )}


      </Canvas>

      {modelError && (
        <div className="viewer-error-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
          <span style={{ color: 'red', fontWeight: 'bold' }}>Failed to load 3D Model. Please upload a valid 3D file (.glb, .gltf, .fbx, .obj, .stl, .ply).</span>
        </div>
      )}
    </div>
  );
}

// Local Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught load error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// "use client";
// import React, { Suspense, useEffect, useState } from 'react';
// import { Canvas, useLoader, useThree, createPortal } from '@react-three/fiber';
// import { OrbitControls, Center, Environment, MeshRefractionMaterial, Bvh, ContactShadows } from '@react-three/drei';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
// import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
// import { CanvasTexture, TextureLoader, EquirectangularReflectionMapping, Color, DoubleSide, MeshStandardMaterial, MeshPhysicalMaterial, ACESFilmicToneMapping, Box3, Vector3 } from 'three';

// // Monkey patch FBXLoader to prevent crash on FBX files with missing/undefined filenames or texture references.
// if (FBXLoader && FBXLoader.prototype) {
//   const originalParse = FBXLoader.prototype.parse;
//   FBXLoader.prototype.parse = function (FBXBuffer, path) {
//     const propsToPatch = ['RelativeFilename', 'Filename', 'FileName'];
//     const originalDescriptors = {};

//     propsToPatch.forEach((prop) => {
//       if (prop in Object.prototype) {
//         originalDescriptors[prop] = Object.getOwnPropertyDescriptor(Object.prototype, prop);
//       }

//       Object.defineProperty(Object.prototype, prop, {
//         get() {
//           return '';
//         },
//         set(val) {
//           Object.defineProperty(this, prop, {
//             value: val,
//             writable: true,
//             enumerable: true,
//             configurable: true,
//           });
//         },
//         configurable: true,
//       });
//     });

//     try {
//       return originalParse.call(this, FBXBuffer, path);
//     } finally {
//       // Restore Object.prototype to original state
//       propsToPatch.forEach((prop) => {
//         delete Object.prototype[prop];
//         if (originalDescriptors[prop]) {
//           Object.defineProperty(Object.prototype, prop, originalDescriptors[prop]);
//         }
//       });
//     }
//   };
// }

// // Helper to deduce format from path/name if not explicitly set
// function getFileFormat(url) {
//   if (!url) return 'gltf';
//   const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
//   if (cleanUrl.endsWith('.fbx')) return 'fbx';
//   if (cleanUrl.endsWith('.obj')) return 'obj';
//   if (cleanUrl.endsWith('.stl')) return 'stl';
//   if (cleanUrl.endsWith('.ply')) return 'ply';
//   return 'gltf';
// }

// // Dynamically Loads User's GLTF/GLB/FBX/OBJ/STL/PLY model from Blob URL or manual path
// let studioEnvMapInstance = null;
// const getStudioEnvMap = () => {
//   if (studioEnvMapInstance) return studioEnvMapInstance;

//   const canvas = document.createElement('canvas');
//   canvas.width = 2048;
//   canvas.height = 1024;
//   const ctx = canvas.getContext('2d');

//   // Balanced dark grey background for contrast without being overly black
//   ctx.fillStyle = '#1b1b1c';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Draw 8 symmetric, wide studio lights for bright, glowing highlights
//   for (let i = 0; i < 8; i++) {
//     const startX = i * 256;

//     // 1. Softbox edge (grey) - much wider now (50% of the segment)
//     ctx.fillStyle = '#808088';
//     ctx.fillRect(startX + 64, 0, 128, 1024);

//     // 2. Bright white center for intense highlights
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(startX + 88, 0, 80, 1024);
//   }

//   // Add symmetric horizontal bands
//   ctx.fillStyle = '#808088';
//   ctx.fillRect(0, 256, 2048, 80);
//   ctx.fillRect(0, 768, 2048, 80);

//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(0, 276, 2048, 40);
//   ctx.fillRect(0, 788, 2048, 40);

//   const texture = new CanvasTexture(canvas);
//   texture.mapping = EquirectangularReflectionMapping;
//   studioEnvMapInstance = texture;
//   return texture;
// };

// let diamondEnvMapInstance = null;
// const getDiamondEnvMap = () => {
//   if (diamondEnvMapInstance) return diamondEnvMapInstance;

//   const canvas = document.createElement('canvas');
//   canvas.width = 4096;
//   canvas.height = 2048;
//   const ctx = canvas.getContext('2d');

//   // Lighter grey background to significantly reduce black shadows inside the diamond
//   ctx.fillStyle = '#4c4c4dff';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Draw perfectly symmetric studio lights around the 360 environment (8 segments)
//   for (let i = 0; i < 8; i++) {
//     const startX = i * 512;
//     ctx.fillStyle = '#9292a1ff';
//     ctx.fillRect(startX + 56, 0, 400, 2048);
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(startX + 136, 0, 240, 2048);
//   }

//   // Add symmetric horizontal bands
//   ctx.fillStyle = '#afafb3ff';
//   ctx.fillRect(0, 512, 4096, 160);
//   ctx.fillRect(0, 1536, 4096, 160);
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(0, 552, 4096, 80);
//   ctx.fillRect(0, 1576, 4096, 80);

//   // Soft white caps to prevent completely black top/bottom holes
//   ctx.fillStyle = '#e0e0e0';
//   ctx.fillRect(0, 0, 4096, 120);
//   ctx.fillRect(0, 1928, 4096, 120);

//   const texture = new CanvasTexture(canvas);
//   texture.mapping = EquirectangularReflectionMapping;
//   diamondEnvMapInstance = texture;
//   return texture;
// };

// // Dynamically Loads User's GLTF/GLB/FBX/OBJ/STL/PLY model from Blob URL or manual path
// function UploadedModel({ url, format, envMap, diamondEnvMap }) {
//   const fmt = format || getFileFormat(url);

//   // Select appropriate loader
//   let loaderClass = GLTFLoader;
//   if (fmt === 'fbx') loaderClass = FBXLoader;
//   else if (fmt === 'obj') loaderClass = OBJLoader;
//   else if (fmt === 'stl') loaderClass = STLLoader;
//   else if (fmt === 'ply') loaderClass = PLYLoader;

//   const result = useLoader(loaderClass, url);

//   const { renderObject, diamonds, scaleFactor } = React.useMemo(() => {
//     // Traverse and configure high-fidelity rendering settings for materials
//     // Clone the scene to avoid modifying the cached result from useLoader
//     const object = result.scene ? result.scene.clone() : result.clone();
//     const list = [];
//     let targetScale = 1;

//     if (object && typeof object.traverse === 'function') {
//       // Auto-scale model so its maximum dimension is exactly 1.0 unit (normalizes mm, cm, m exports)
//       const box = new Box3().setFromObject(object);
//       const size = new Vector3();
//       box.getSize(size);
//       const maxDim = Math.max(size.x, size.y, size.z);
//       if (maxDim > 0) {
//         targetScale = 1.0 / maxDim;
//         console.log(`[3D AutoScale] Original Max Dim: ${maxDim} | Scaling factor: ${targetScale}`);
//       }

//       object.traverse((child) => {
//         if (child.isMesh) {
//           child.castShadow = true;
//           child.receiveShadow = true;

//           if (child.material) {
//             const materials = Array.isArray(child.material) ? child.material : [child.material];
//             let isDiamondMesh = false;

//             materials.forEach((mat, idx) => {
//               const matName = (mat.name || '').toLowerCase();
//               const meshName = (child.name || '').toLowerCase();

//               // Check if the material is physically colorless/white (typical for diamonds)
//               const isColorless = mat.color && (mat.color.r > 0.8 && mat.color.g > 0.8 && mat.color.b > 0.8);
//               const hasMetalKeywords = (
//                 matName.includes('metal') || matName.includes('gold') || matName.includes('rose') || matName.includes('plat') || matName.includes('silver') || matName.includes('band') || matName.includes('prong') || matName.includes('shank') || matName.includes('setting') || matName.includes('head') || matName.includes('bezel') ||
//                 meshName.includes('metal') || meshName.includes('gold') || meshName.includes('rose') || meshName.includes('plat') || meshName.includes('silver') || meshName.includes('band') || meshName.includes('prong') || meshName.includes('shank') || meshName.includes('setting') || meshName.includes('head') || meshName.includes('bezel')
//               );

//               // 1. Detect Diamond/Gemstone: by material name, mesh name, or physical properties
//               const isDiamond = (
//                 matName.includes('diamond') ||
//                 matName.includes('gem') ||
//                 matName.includes('stone') ||
//                 matName.includes('brilliant') ||
//                 matName.includes('crystal') ||
//                 matName.includes('glass') ||
//                 matName.includes('refract') ||
//                 matName.includes('jewel') ||
//                 matName.includes('sapphire') ||
//                 matName.includes('ruby') ||
//                 matName.includes('emerald') ||
//                 matName.includes('brulik') ||
//                 matName.includes('baguette') ||
//                 matName.includes('baguete') ||
//                 matName.includes('baguet') ||
//                 matName.includes('cut') ||
//                 matName.includes('facet') ||
//                 matName.includes('cz') ||
//                 matName.includes('zircon') ||
//                 matName.includes('zirconia') ||
//                 matName.includes('moissanite') ||
//                 matName.includes('melee') ||
//                 meshName.includes('diamond') ||
//                 meshName.includes('gem') ||
//                 meshName.includes('stone') ||
//                 meshName.includes('brilliant') ||
//                 meshName.includes('crystal') ||
//                 meshName.includes('glass') ||
//                 meshName.includes('refract') ||
//                 meshName.includes('jewel') ||
//                 meshName.includes('sapphire') ||
//                 meshName.includes('ruby') ||
//                 meshName.includes('emerald') ||
//                 meshName.includes('brulik') ||
//                 meshName.includes('baguette') ||
//                 meshName.includes('baguete') ||
//                 meshName.includes('baguet') ||
//                 meshName.includes('cut') ||
//                 meshName.includes('facet') ||
//                 meshName.includes('cz') ||
//                 meshName.includes('zircon') ||
//                 meshName.includes('zirconia') ||
//                 meshName.includes('moissanite') ||
//                 meshName.includes('melee') ||
//                 mat.transmission > 0.1 ||
//                 mat.transparent === true ||
//                 (mat.opacity !== undefined && mat.opacity < 1.0) ||
//                 (isColorless && !hasMetalKeywords) // Smart heuristic for generic diamond names
//               );

//               console.log(`[3D Loader] Mesh: "${child.name}" | Material: "${mat.name}" | Is Diamond: ${isDiamond}`);

//               if (isDiamond) {
//                 isDiamondMesh = true;
//               } else {
//                 // Keep original metal material but tweak roughness to soften harsh black shadows
//                 if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
//                   mat.roughness = Math.max(mat.roughness || 0, 0.12);
//                   mat.envMapIntensity = Math.max(mat.envMapIntensity || 1, 2.5);
//                 }
//               }
//             });

//             if (isDiamondMesh) {
//               child.castShadow = false;
//               child.receiveShadow = false;
//               list.push(child);
//             }
//           }
//         }
//       });
//     }
//     return { renderObject: object, diamonds: list, scaleFactor: targetScale };
//   }, [result]);

//   // If geometry format (STL / PLY), wrap it in a mesh with default standard material
//   if (fmt === 'stl' || fmt === 'ply') {
//     return (
//       <mesh geometry={result} castShadow receiveShadow>
//         <meshPhysicalMaterial
//           color="#d4af37" // Beautiful default gold for untextured STL/PLY geometry
//           metalness={1.0}
//           roughness={0.08}
//           envMapIntensity={3.5}
//         />
//       </mesh>
//     );
//   }

//   return (
//     <>
//       <group scale={scaleFactor}>
//         <primitive object={renderObject} />
//       </group>
//       {diamonds.map((mesh) => {
//         const matColor = Array.isArray(mesh.material) ? mesh.material[0]?.color : mesh.material?.color;
//         return createPortal(
//           <MeshRefractionMaterial
//             key={mesh.uuid}
//             envMap={diamondEnvMap || envMap}
//             bounces={4}                                       // Standard bounces
//             ior={2.4}                                         // Standard diamond IOR
//             color={matColor || "#ffffff"}
//             aberrationStrength={0.002}                         // Minor, realistic RGB shades on facet borders
//             fresnel={0.8}                                     // Standard fresnel
//             toneMapped={true}                                 // Keeping tone mapping on to prevent pure white blowouts
//             fastChroma={true}                                 // fastChroma gives the crisp RGB border effect
//           />,
//           mesh
//         );
//       })}
//     </>
//   );
// }

// // Fixed Tone Mapping & Exposure Manager
// function SceneController() {
//   const { gl, scene } = useThree();
//   useEffect(() => {
//     // Enable photographic ACES Filmic tone mapping
//     gl.toneMapping = ACESFilmicToneMapping;
//     gl.toneMappingExposure = 0.95; // Reduced to prevent highlight overexposure and blurry haze
//     // Set global environment intensity to a balanced physical level
//     scene.environmentIntensity = 0.9; // Slightly reduced to keep reflection highlights crisp
//     // Set solid background matching container
//     scene.background = new Color('#f8fafc');
//   }, [gl, scene]);
//   return null;
// }

// // Component to render environment & model when a custom HDR/EXR is uploaded
// function CustomHdrScene({ url, type, uploadedModel, modelError, setModelError }) {
//   const isExr = type === 'exr' || url.toLowerCase().endsWith('.exr') || url.includes('.exr');
//   const isHdr = type === 'hdr' || url.toLowerCase().endsWith('.hdr') || url.includes('.hdr');

//   const loader = isExr ? EXRLoader : (isHdr ? RGBELoader : TextureLoader);
//   const texture = useLoader(loader, url);

//   useEffect(() => {
//     if (texture) {
//       texture.mapping = EquirectangularReflectionMapping;
//     }
//   }, [texture]);

//   return (
//     <>
//       <Environment map={texture} background={false} />
//       <Bvh>
//         <group>
//           <Center>
//             {uploadedModel?.url && !modelError ? (
//               <ErrorBoundary onError={() => setModelError(true)}>
//                 <UploadedModel
//                   url={uploadedModel.url}
//                   format={uploadedModel.format}
//                   envMap={texture}
//                 />
//               </ErrorBoundary>
//             ) : null}
//           </Center>
//         </group>
//       </Bvh>
//     </>
//   );
// }

// // Component to render environment & model using procedural high-contrast studio map by default
// function DefaultStudioScene({ uploadedModel, modelError, setModelError }) {
//   const studioEnvMap = getStudioEnvMap();
//   const diamondEnvMap = getDiamondEnvMap();

//   return (
//     <>
//       <Environment map={studioEnvMap} background={false} />
//       <Bvh>
//         <group>
//           <Center>
//             {uploadedModel?.url && !modelError ? (
//               <ErrorBoundary onError={() => setModelError(true)}>
//                 <UploadedModel
//                   url={uploadedModel.url}
//                   format={uploadedModel.format}
//                   envMap={studioEnvMap}
//                   diamondEnvMap={diamondEnvMap}
//                 />
//               </ErrorBoundary>
//             ) : null}
//           </Center>
//         </group>
//       </Bvh>
//     </>
//   );
// }

// export default function ProductViewer({ uploadedModel, uploadedHdr }) {
//   const [modelError, setModelError] = useState(false);

//   useEffect(() => {
//     setModelError(false);
//   }, [uploadedModel?.url]);

//   return (
//     <div className="product-viewer-container" style={{ width: '100%', height: '100%', minHeight: '500px' }}>
//       <Canvas
//         camera={{ position: [0, 1.2, 3.0], fov: 45 }}
//         gl={{ antialias: true }}
//       >
//         <SceneController />

//         {/* Soft contact shadows below the ring for realistic grounding */}
//         <ContactShadows
//           position={[0, -0.55, 0]}
//           opacity={0.35}
//           scale={4.0}
//           blur={1.5}
//           far={1.2}
//           color="#000000"
//         />

//         {/* Subtle Ambient base lighting to fill dark shadow areas realistically */}
//         <ambientLight intensity={0.5} />

//         {/* Primary Key Light from top-front-right */}
//         <directionalLight
//           position={[5, 8, 5]}
//           intensity={0.6}
//         />

//         {/* Subtle Fill Light from left to soften shadows */}
//         <directionalLight
//           position={[-5, 4, 2]}
//           intensity={0.4}
//         />

//         {/* Back Light to separate ring from the background */}
//         <directionalLight
//           position={[-3, 6, -5]}
//           intensity={0.15}
//         />

//         <OrbitControls
//           enablePan={true}
//           enableZoom={true}
//           minDistance={1}
//           maxDistance={2.8}
//           minPolarAngle={Math.PI / 6} // Stops rotation right at this tilted top view
//           maxPolarAngle={Math.PI / 2 + 0.05} // Prevent rotating underneath the ring
//           autoRotate={true}
//           autoRotateSpeed={1}
//           makeDefault
//         />

//         {/* Environment & 3D Model Setup */}
//         {uploadedHdr?.url ? (
//           <Suspense fallback={null}>
//             <CustomHdrScene
//               url={uploadedHdr.url}
//               type={uploadedHdr.type}
//               uploadedModel={uploadedModel}
//               modelError={modelError}
//               setModelError={setModelError}
//             />
//           </Suspense>
//         ) : (
//           <Suspense fallback={null}>
//             <DefaultStudioScene
//               uploadedModel={uploadedModel}
//               modelError={modelError}
//               setModelError={setModelError}
//             />
//           </Suspense>
//         )}


//       </Canvas>

//       {modelError && (
//         <div className="viewer-error-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
//           <span style={{ color: 'red', fontWeight: 'bold' }}>Failed to load 3D Model. Please upload a valid 3D file (.glb, .gltf, .fbx, .obj, .stl, .ply).</span>
//         </div>
//       )}
//     </div>
//   );
// }

// // Local Error Boundary
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught load error:", error, errorInfo);
//     if (this.props.onError) {
//       this.props.onError();
//     }
//   }

//   render() {
//     if (this.state.hasError) {
//       return null;
//     }
//     return this.props.children;
//   }
// }
