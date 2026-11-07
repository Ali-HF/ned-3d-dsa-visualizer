import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useViewportStore } from '../../state/useViewportStore';
import { getCameraPoseForPreset } from './cameraPoses';
import { formatRefLabel } from '../../engine/traceEngine';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const cameraPreset = useViewportStore((s) => s.cameraPreset);
  const cameraCommandVersion = useViewportStore((s) => s.cameraCommandVersion);
  const autoFollowCamera = useViewportStore((s) => s.autoFollowCamera);
  const pauseAutoFollowCamera = useViewportStore((s) => s.pauseAutoFollowCamera);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);
  const sceneObjects = useViewportStore((s) => s.sceneObjects);

  const desiredPos = useRef(new THREE.Vector3(9, 7.5, 11));
  const desiredTarget = useRef(new THREE.Vector3(0, 1.4, 0));
  const isTransitioning = useRef(false);
  const isUserDragging = useRef(false);

  // Only transition the camera when the user explicitly triggers a View preset or shortcut
  useEffect(() => {
    if (cameraCommandVersion === 0) return;
    const { selectedId, sceneObjects: latestObjects } = useViewportStore.getState();
    const selectedObj = selectedId ? latestObjects[selectedId] : undefined;
    const pose = getCameraPoseForPreset(cameraPreset, selectedObj?.position);
    desiredPos.current.set(...pose.position);
    desiredTarget.current.set(...pose.target);
    isTransitioning.current = true;
  }, [cameraPreset, cameraCommandVersion]);

  useFrame((_, delta) => {
    if (!controlsRef.current || isUserDragging.current) return;

    if (isTransitioning.current) {
      const step = Math.min(1, delta * 9);
      camera.position.lerp(desiredPos.current, step);
      controlsRef.current.target.lerp(desiredTarget.current, step);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(desiredPos.current) < 0.03 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.03
      ) {
        camera.position.copy(desiredPos.current);
        controlsRef.current.target.copy(desiredTarget.current);
        controlsRef.current.update();
        isTransitioning.current = false;
      }
      return;
    }

    // Optional: Follow active element only if user turned on "Follow the action"
    if (autoFollowCamera) {
      let activeId: string | null = null;
      if (currentSnapshot.swappedRefs) {
        activeId = formatRefLabel(currentSnapshot.swappedRefs[0]);
      } else if (currentSnapshot.comparedRefs) {
        activeId = formatRefLabel(currentSnapshot.comparedRefs[0]);
      } else if (currentSnapshot.spawnedRef) {
        activeId = formatRefLabel(currentSnapshot.spawnedRef);
      } else if (currentSnapshot.activeVisitId) {
        activeId = currentSnapshot.activeVisitId;
      }

      if (activeId && sceneObjects[activeId]) {
        const [x, y, z] = sceneObjects[activeId].position;
        const followTarget = new THREE.Vector3(x * 0.45, Math.max(1.2, y), z);
        controlsRef.current.target.lerp(followTarget, Math.min(1, delta * 4));
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={45}
      onStart={() => {
        // Any manual orbit, pan, or zoom immediately gives full control to the user
        isUserDragging.current = true;
        isTransitioning.current = false;
        pauseAutoFollowCamera();
      }}
      onEnd={() => {
        isUserDragging.current = false;
      }}
    />
  );
}
