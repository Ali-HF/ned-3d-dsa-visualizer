import { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DirectedEdge3DProps {
  from: [number, number, number];
  to: [number, number, number];
  label?: string;
  highlighted?: boolean;
}

/**
 * Renders a 3D pointer arrow between two nodes (e.g. next, left, right).
 * Uses drei <Line> for the shaft, a cone mesh for the arrowhead, and
 * drei <Text> for safe 3D text labels (never raw HTML).
 */
export function DirectedEdge3D({
  from,
  to,
  label,
  highlighted = false,
}: DirectedEdge3DProps) {
  const { startPoint, endPoint, midPoint, coneQuaternion } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = end.clone().sub(start);
    const len = dir.length();
    dir.normalize();

    // Offset start and end slightly so arrow sits cleanly outside node radius (0.55)
    const nodeRadius = 0.58;
    const actualStart = start.clone().addScaledVector(dir, Math.min(nodeRadius, len * 0.25));
    const actualEnd = end.clone().addScaledVector(dir, -Math.min(nodeRadius + 0.15, len * 0.3));
    const mid = actualStart.clone().lerp(actualEnd, 0.5);
    mid.y += 0.24;

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

    return {
      startPoint: [actualStart.x, actualStart.y, actualStart.z] as [number, number, number],
      endPoint: [actualEnd.x, actualEnd.y, actualEnd.z] as [number, number, number],
      midPoint: [mid.x, mid.y, mid.z] as [number, number, number],
      coneQuaternion: quat,
    };
  }, [from, to]);

  const color = highlighted ? '#ff9f2e' : '#58a6ff';

  return (
    <group>
      <Line
        points={[startPoint, endPoint]}
        color={color}
        lineWidth={highlighted ? 2.8 : 1.8}
      />
      <mesh position={endPoint} quaternion={coneQuaternion}>
        <coneGeometry args={[0.14, 0.34, 12]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
      </mesh>
      {label && (
        <Text
          position={midPoint}
          fontSize={0.24}
          color={highlighted ? '#ffd180' : '#9ecbff'}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

