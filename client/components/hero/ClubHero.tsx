import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Particles() {
  const count = 1500;
  const radius = 2.2;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.5 + Math.random() * 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr.set([x, y, z], i * 3);
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.07;
      ref.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={new THREE.Color("#7c3aed")}
        sizeAttenuation
      />
    </points>
  );
}

export default function ClubHero() {
  return (
    <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <Particles />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-wider bg-background/70 backdrop-blur">
            Central Skill for Entrepreneur & Development
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-primary to-indigo-600">
            CSED Club
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Ignite innovation, build projects, and lead with entrepreneurial
            spirit. Join events, showcase projects, and be part of our vibrant
            community.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="#events"
              className="pointer-events-auto inline-flex items-center rounded-md bg-primary px-5 py-3 text-primary-foreground hover:bg-primary/90 transition"
            >
              Explore Events
            </a>
            <a
              href="#projects"
              className="pointer-events-auto inline-flex items-center rounded-md border px-5 py-3 hover:bg-accent transition"
            >
              View Projects
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
