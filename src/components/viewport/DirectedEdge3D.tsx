import { Suspense, useMemo } from 'react';
import { Billboard, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DirectedEdge3DProps {
  from: [number, number, number];
  to: [number, number, number];
  label?: string;
  highlighted?: boolean;
  bidirectional?: boolean;
}

export function DirectedEdge3D({
  from,
  to,
  label,
  highlighted = false,
  bidirectional = false,
}: DirectedEdge3DProps) {
  const isPrev = label === 'prev';
  const isLoopOrWrap =
    label === 'loop' || Boolean(label && label.toLowerCase().includes('wrap'));

  const { linePoints, endPoint, midPoint, coneQuaternion } = useMemo(() => {
    const yShift = isPrev ? -0.22 : bidirectional ? 0.2 : 0;
    const start = new THREE.Vector3(from[0], from[1] + yShift, from[2]);
    const end = new THREE.Vector3(to[0], to[1] + yShift, to[2]);
    const dir = end.clone().sub(start);
    const len = Math.max(0.001, dir.length());
    dir.normalize();

    const nodeRadius = 0.58;
    const actualStart = start
      .clone()
      .addScaledVector(dir, Math.min(nodeRadius, len * 0.25));
    const actualEnd = end
      .clone()
      .addScaledVector(dir, -Math.min(nodeRadius + 0.15, len * 0.3));

    if (isLoopOrWrap || bidirectional) {
      const arcY = isLoopOrWrap ? 1.05 : isPrev ? -0.14 : 0.14;
      const arcZ = isLoopOrWrap ? 0.75 : 0;
      const pts: [number, number, number][] = [];
      const steps = 16;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const s = Math.sin(t * Math.PI);
        pts.push([
          THREE.MathUtils.lerp(actualStart.x, actualEnd.x, t),
          THREE.MathUtils.lerp(actualStart.y, actualEnd.y, t) + s * arcY,
          THREE.MathUtils.lerp(actualStart.z, actualEnd.z, t) + s * arcZ,
        ]);
      }
      const prevPt = new THREE.Vector3(...pts[steps - 1]);
      const lastPt = new THREE.Vector3(...pts[steps]);
      const tangent = lastPt.clone().sub(prevPt).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);
      const mid = pts[Math.floor(steps / 2)];
      const labelYOffset = isPrev ? -0.22 : 0.24;

      return {
        linePoints: pts,
        endPoint: pts[steps],
        midPoint: [mid[0], mid[1] + labelYOffset, mid[2]] as [
          number,
          number,
          number,
        ],
        coneQuaternion: quat,
      };
    }

    const mid = actualStart.clone().lerp(actualEnd, 0.5);
    mid.y += 0.24;

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

    const startTuple: [number, number, number] = [
      actualStart.x,
      actualStart.y,
      actualStart.z,
    ];
    const endTuple: [number, number, number] = [
      actualEnd.x,
      actualEnd.y,
      actualEnd.z,
    ];

    return {
      linePoints: [startTuple, endTuple],
      endPoint: endTuple,
      midPoint: [mid.x, mid.y, mid.z] as [number, number, number],
      coneQuaternion: quat,
    };
  }, [from, to, isPrev, isLoopOrWrap, bidirectional]);

  const color = highlighted
    ? '#ff9f2e'
    : isLoopOrWrap
      ? '#f59e0b'
      : isPrev
        ? '#a78bfa'
        : '#58a6ff';
  const textColor = highlighted
    ? '#ffd180'
    : isLoopOrWrap
      ? '#fde68a'
      : isPrev
        ? '#ddd6fe'
        : '#9ecbff';

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        lineWidth={highlighted ? 2.8 : 1.8}
      />
      <mesh position={endPoint} quaternion={coneQuaternion}>
        <coneGeometry args={[0.14, 0.34, 12]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
      </mesh>
      {label && (
        <Suspense fallback={null}>
          <Billboard position={midPoint}>
            <Text
              fontSize={0.24}
              color={textColor}
              anchorX="center"
              anchorY="middle"
            >
              {label}
            </Text>
          </Billboard>
        </Suspense>
      )}
    </group>
  );
}
