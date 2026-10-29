import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Grid, GizmoHelper, GizmoViewport, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useViewportStore } from '../../state/useViewportStore';
import type { CameraPreset, SceneObjectInfo, TraceStateSnapshot } from '../../types/trace';
import { CameraController } from './CameraController';
import { DirectedEdge3D } from './DirectedEdge3D';
import { formatRefLabel } from '../../engine/traceEngine';
import {
  IconCube,
  IconGrid,
  IconPause,
  IconPlay,
  IconSolid,
  IconTarget,
  IconWireframe,
} from '../icons/StudioIcons';

interface NodeMeshProps {
  obj: SceneObjectInfo;
  selected: boolean;
  wireframe: boolean;
  snapshot: TraceStateSnapshot;
  onSelect: (id: string) => void;
}

function SceneObjectMesh({
  obj,
  selected,
  wireframe,
  snapshot,
  onSelect,
}: NodeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const barMeshRef = useRef<THREE.Mesh>(null);
  const capMeshRef = useRef<THREE.Mesh>(null);
  const valueTextRef = useRef<THREE.Group>(null);

  const isArrayCell = obj.kind === 'array-cell';
  const numericVal = typeof obj.value === 'number' ? obj.value : 20;
  const targetHeight = isArrayCell
    ? Math.max(0.45, Math.min(4.8, Math.abs(numericVal) / 22))
    : 1.0;

  const isCompared =
    snapshot.comparedRefs !== null &&
    (formatRefLabel(snapshot.comparedRefs[0]) === obj.id ||
      formatRefLabel(snapshot.comparedRefs[1]) === obj.id);

  const isSwapped =
    snapshot.swappedRefs !== null &&
    (formatRefLabel(snapshot.swappedRefs[0]) === obj.id ||
      formatRefLabel(snapshot.swappedRefs[1]) === obj.id);

  const isSpawned =
    snapshot.spawnedRef !== null &&
    (formatRefLabel(snapshot.spawnedRef) === obj.id || snapshot.spawnedRef.id === obj.id);

  const isActiveVisit = snapshot.activeVisitId === obj.id;
  const visitOrderIndex = snapshot.visitedOrder.indexOf(obj.id);

  // Precision CAD / Studio material palette (colour-blind safe + distinct tags)
  let fillColor =
    obj.kind === 'array-cell'
      ? '#3d6cb9'
      : obj.kind === 'list-node'
        ? '#2e8b6e'
        : '#6c5ce7';
  let statusBadge = '';

  if (isSwapped) {
    fillColor = '#d6458b';
    statusBadge = 'SWP';
  } else if (isCompared) {
    fillColor = '#d99026';
    statusBadge = 'CMP';
  } else if (isSpawned) {
    fillColor = '#2ea063';
    statusBadge = 'WRT';
  } else if (isActiveVisit) {
    fillColor = '#2899b8';
    statusBadge = 'VIS';
  } else if (visitOrderIndex >= 0) {
    fillColor = '#2b5b84';
  }

  const outlineColor = selected
    ? '#ff8c1a'
    : isSwapped
      ? '#ff7eb6'
      : isCompared
        ? '#ffca57'
        : '#1f2329';

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const step = Math.min(1, delta * 14);

    if (isArrayCell) {
      // Array cell group stays anchored at ground X/Z; bar height interpolates smoothly
      const targetGroupPos = new THREE.Vector3(obj.position[0], 0, obj.position[2]);
      if (isSwapped) {
        targetGroupPos.z += 0.28;
      }
      groupRef.current.position.lerp(targetGroupPos, step);

      if (barMeshRef.current) {
        barMeshRef.current.scale.y = THREE.MathUtils.lerp(
          barMeshRef.current.scale.y,
          targetHeight,
          step,
        );
        barMeshRef.current.position.y = barMeshRef.current.scale.y / 2 + 0.06;
      }
      if (capMeshRef.current && barMeshRef.current) {
        capMeshRef.current.position.y = barMeshRef.current.scale.y + 0.08;
      }
      if (valueTextRef.current && barMeshRef.current) {
        valueTextRef.current.position.y = barMeshRef.current.scale.y + 0.42;
      }
    } else {
      const targetNodePos = new THREE.Vector3(...obj.position);
      if (isActiveVisit) {
        targetNodePos.y += Math.sin(state.clock.elapsedTime * 6) * 0.06;
      }
      groupRef.current.position.lerp(targetNodePos, step);
    }
  });

  return (
    <group
      ref={groupRef}
      position={isArrayCell ? [obj.position[0], 0, obj.position[2]] : obj.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(obj.id);
      }}
    >
      {isArrayCell ? (
        <>
          {/* Machined memory slot plinth on the ground grid */}
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[1.36, 0.06, 1.36]} />
            <meshStandardMaterial
              color={selected ? '#382a1e' : '#20232a'}
              roughness={0.7}
              metalness={0.2}
            />
            <Edges color={selected ? '#ff8c1a' : '#323844'} />
          </mesh>

          {/* Animated vertical value bar */}
          <mesh
            ref={barMeshRef}
            position={[0, targetHeight / 2 + 0.06, 0]}
            scale={[1, targetHeight, 1]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.08, 1, 1.08]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.35}
              metalness={0.18}
              wireframe={wireframe}
            />
            <Edges color={outlineColor} />
          </mesh>

          {/* Metallic top cap plate */}
          <mesh ref={capMeshRef} position={[0, targetHeight + 0.08, 0]}>
            <boxGeometry args={[1.1, 0.04, 1.1]} />
            <meshStandardMaterial
              color={selected ? '#ff9f38' : '#7b93b8'}
              roughness={0.25}
              metalness={0.55}
            />
          </mesh>

          {/* Value & status callout */}
          <group ref={valueTextRef} position={[0, targetHeight + 0.42, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.31}
              color={selected ? '#ffa64d' : '#e6edf3'}
              anchorX="center"
              anchorY="middle"
            >
              {String(obj.value)}
            </Text>

            {(visitOrderIndex >= 0 || statusBadge) && (
              <Text
                position={[0, 0.34, 0]}
                fontSize={0.18}
                color={isSwapped ? '#ff99c8' : isCompared ? '#ffd166' : '#72d6ef'}
                anchorX="center"
                anchorY="middle"
              >
                {statusBadge
                  ? visitOrderIndex >= 0
                    ? `[${statusBadge} #${visitOrderIndex + 1}]`
                    : `[${statusBadge}]`
                  : `#${visitOrderIndex + 1}`}
              </Text>
            )}
          </group>

          {/* Ground plane index & memory address stamp */}
          <Text
            position={[0, 0.08, 0.86]}
            rotation={[-Math.PI / 4, 0, 0]}
            fontSize={0.19}
            color={selected ? '#ffa64d' : '#a8b3c2'}
            anchorX="center"
            anchorY="middle"
          >
            {obj.label}
          </Text>
          <Text
            position={[0, 0.05, 1.12]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.15}
            color="#667182"
            anchorX="center"
            anchorY="middle"
          >
            {obj.memoryAddress}
          </Text>
        </>
      ) : (
        <>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.5, 28, 28]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.32}
              metalness={0.22}
              wireframe={wireframe}
            />
          </mesh>

          {selected && (
            <mesh>
              <sphereGeometry args={[0.54, 16, 16]} />
              <meshBasicMaterial color="#ff8c1a" wireframe />
            </mesh>
          )}

          <Text
            position={[0, 0.8, 0]}
            fontSize={0.28}
            color={selected ? '#ffa64d' : '#e6edf3'}
            anchorX="center"
            anchorY="middle"
          >
            {String(obj.value)}
          </Text>

          <Text
            position={[0, -0.78, 0.35]}
            fontSize={0.18}
            color="#7d8590"
            anchorX="center"
            anchorY="middle"
          >
            {`${obj.label} [${obj.memoryAddress}]`}
          </Text>
        </>
      )}
    </group>
  );
}

/**
 * 3D spline arc connecting two elements currently being compared (`compare`)
 * or swapped (`swap`).
 */
function InteractionArc3D({
  fromObj,
  toObj,
  mode,
}: {
  fromObj: SceneObjectInfo;
  toObj: SceneObjectInfo;
  mode: 'compare' | 'swap';
}) {
  const { points, midPoint } = useMemo(() => {
    const start = new THREE.Vector3(
      fromObj.position[0],
      fromObj.position[1] * 2 + 0.85,
      fromObj.position[2],
    );
    const end = new THREE.Vector3(
      toObj.position[0],
      toObj.position[1] * 2 + 0.85,
      toObj.position[2],
    );
    const mid = start.clone().lerp(end, 0.5);
    mid.y = Math.max(start.y, end.y) + (mode === 'swap' ? 1.2 : 0.8);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts = curve.getPoints(28).map((p) => [p.x, p.y, p.z] as [number, number, number]);
    return {
      points: pts,
      midPoint: [mid.x, mid.y + 0.22, mid.z] as [number, number, number],
    };
  }, [fromObj, toObj, mode]);

  const color = mode === 'swap' ? '#d6458b' : '#d99026';

  return (
    <group>
      <Line points={points} color={color} lineWidth={2.5} />
      <Text
        position={midPoint}
        fontSize={0.22}
        color={mode === 'swap' ? '#ff99c8' : '#ffd166'}
        anchorX="center"
        anchorY="middle"
      >
        {mode === 'swap'
          ? `SWP [${fromObj.value} <-> ${toObj.value}]`
          : `CMP [${fromObj.value} : ${toObj.value}]`}
      </Text>
    </group>
  );
}

/**
 * Blender-style world X (red) and Z (blue) origin lines on the ground plane.
 */
function WorldOriginAxes() {
  return (
    <group position={[0, 0.006, 0]}>
      <Line
        points={[
          [-24, 0, 0],
          [24, 0, 0],
        ]}
        color="#8a3333"
        lineWidth={1.4}
      />
      <Line
        points={[
          [0, 0, -24],
          [0, 0, 24],
        ]}
        color="#2f5999"
        lineWidth={1.4}
      />
    </group>
  );
}

function SceneContents() {
  const sceneObjects = useViewportStore((s) => s.sceneObjects);
  const selectedId = useViewportStore((s) => s.selectedId);
  const selectObject = useViewportStore((s) => s.selectObject);
  const showGrid = useViewportStore((s) => s.showGrid);
  const wireframe = useViewportStore((s) => s.wireframe);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);

  const objectList = Object.values(sceneObjects);

  const comparePair = useMemo(() => {
    if (!currentSnapshot.comparedRefs) return null;
    const a = sceneObjects[formatRefLabel(currentSnapshot.comparedRefs[0])];
    const b = sceneObjects[formatRefLabel(currentSnapshot.comparedRefs[1])];
    return a && b ? { a, b } : null;
  }, [currentSnapshot.comparedRefs, sceneObjects]);

  const swapPair = useMemo(() => {
    if (!currentSnapshot.swappedRefs) return null;
    const a = sceneObjects[formatRefLabel(currentSnapshot.swappedRefs[0])];
    const b = sceneObjects[formatRefLabel(currentSnapshot.swappedRefs[1])];
    return a && b ? { a, b } : null;
  }, [currentSnapshot.swappedRefs, sceneObjects]);

  return (
    <>
      <color attach="background" args={['#1d1f23']} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[12, 20, 14]} intensity={1.1} castShadow />
      <directionalLight position={[-12, 10, -10]} intensity={0.35} />

      <CameraController />

      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[48, 48]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#2a2d34"
            sectionSize={5}
            sectionThickness={1.0}
            sectionColor="#3b4049"
            fadeDistance={42}
            fadeStrength={1.2}
            infiniteGrid
          />
          <WorldOriginAxes />
        </>
      )}

      {/* Render pointer arrows (edges) between nodes */}
      {objectList.map((obj) =>
        obj.linksTo.map((link) => {
          const target = sceneObjects[link.targetId];
          if (!target) return null;
          const highlighted = selectedId === obj.id || selectedId === target.id;
          return (
            <DirectedEdge3D
              key={`${obj.id}->${link.targetId}-${link.label}`}
              from={obj.position}
              to={target.position}
              label={link.label}
              highlighted={highlighted}
            />
          );
        }),
      )}

      {/* 3D Comparison Beam & Swap Arc */}
      {comparePair && (
        <InteractionArc3D fromObj={comparePair.a} toObj={comparePair.b} mode="compare" />
      )}
      {swapPair && (
        <InteractionArc3D fromObj={swapPair.a} toObj={swapPair.b} mode="swap" />
      )}

      {/* Render clickable 3D objects */}
      {objectList.map((obj) => (
        <SceneObjectMesh
          key={obj.id}
          obj={obj}
          selected={selectedId === obj.id}
          wireframe={wireframe}
          snapshot={currentSnapshot}
          onSelect={(id) => selectObject(id)}
        />
      ))}

      {/* Blender XYZ Axis Gizmo */}
      <GizmoHelper alignment="top-right" margin={[62, 62]}>
        <GizmoViewport
          axisColors={['#d94040', '#56b849', '#3b78d8']}
          labelColor="#111317"
        />
      </GizmoHelper>
    </>
  );
}

const CAMERA_PRESETS: { id: CameraPreset; label: string; shortcut: string }[] = [
  { id: 'isometric', label: 'Persp', shortcut: '0' },
  { id: 'front', label: 'Front', shortcut: '1' },
  { id: 'top', label: 'Top', shortcut: '7' },
  { id: 'side', label: 'Right', shortcut: '3' },
  { id: 'focus', label: 'Focus', shortcut: '.' },
];

export function BlenderViewport() {
  const cameraPreset = useViewportStore((s) => s.cameraPreset);
  const triggerCameraPreset = useViewportStore((s) => s.triggerCameraPreset);
  const selectObject = useViewportStore((s) => s.selectObject);
  const showGrid = useViewportStore((s) => s.showGrid);
  const toggleGrid = useViewportStore((s) => s.toggleGrid);
  const wireframe = useViewportStore((s) => s.wireframe);
  const toggleWireframe = useViewportStore((s) => s.toggleWireframe);
  const autoFollowCamera = useViewportStore((s) => s.autoFollowCamera);
  const toggleAutoFollowCamera = useViewportStore((s) => s.toggleAutoFollowCamera);
  const sceneObjects = useViewportStore((s) => s.sceneObjects);
  const selectedId = useViewportStore((s) => s.selectedId);
  const isPlaying = useViewportStore((s) => s.isPlaying);
  const togglePlay = useViewportStore((s) => s.togglePlay);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);

  return (
    <div className="viewport-container">
      {/* Docked Blender 4.2 Viewport Header Toolbar */}
      <div className="viewport-header-bar">
        <div className="vh-left">
          <span className="vh-context-label">
            <IconCube />
            <span>Object Mode</span>
          </span>

          <div className="vh-segmented">
            <button
              type="button"
              className={`vh-seg-btn ${showGrid ? 'active' : ''}`}
              onClick={toggleGrid}
              title="Toggle Floor Grid"
            >
              <IconGrid />
              <span>Floor</span>
            </button>
            <button
              type="button"
              className={`vh-seg-btn ${!wireframe ? 'active' : ''}`}
              onClick={() => {
                if (wireframe) toggleWireframe();
              }}
              title="Solid Studio Shading"
            >
              <IconSolid />
              <span>Solid</span>
            </button>
            <button
              type="button"
              className={`vh-seg-btn ${wireframe ? 'active' : ''}`}
              onClick={() => {
                if (!wireframe) toggleWireframe();
              }}
              title="Wireframe Overlay"
            >
              <IconWireframe />
              <span>Wire</span>
            </button>
          </div>

          <button
            type="button"
            className={`vh-toggle-btn ${autoFollowCamera ? 'active' : ''}`}
            onClick={toggleAutoFollowCamera}
            title="Track Active Element (Automatically disengages on manual orbit)"
          >
            <IconTarget />
            <span>Track Active</span>
          </button>
        </div>

        <div className="vh-right" role="toolbar" aria-label="Camera Presets">
          <div className="vh-segmented">
            {CAMERA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`vh-seg-btn ${cameraPreset === preset.id ? 'active' : ''}`}
                onClick={() => triggerCameraPreset(preset.id)}
                title={`Camera View: ${preset.label} (Numpad ${preset.shortcut})`}
              >
                <span>{preset.label}</span>
                <kbd>{preset.shortcut}</kbd>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top-Left Viewport Telemetry & State Legend Overlay */}
      <div className="viewport-telemetry-overlay" aria-label="Viewport Overlay Info">
        <div className="vt-row">
          <span className="vt-key">Camera:</span>
          <span className="vt-val">{cameraPreset.toUpperCase()}</span>
          <span className="vt-sep">|</span>
          <span className="vt-key">Objects:</span>
          <span className="vt-val">{Object.keys(sceneObjects).length}</span>
          <span className="vt-sep">|</span>
          <span className="vt-key">Active:</span>
          <span className="vt-val accent">{selectedId ?? 'None'}</span>
        </div>
        <div className="vt-legend">
          <span className="legend-item">
            <i className="legend-swatch cmp" /> CMP
          </span>
          <span className="legend-item">
            <i className="legend-swatch swp" /> SWP
          </span>
          <span className="legend-item">
            <i className="legend-swatch set" /> WRT
          </span>
          <span className="legend-item">
            <i className="legend-swatch vis" /> VIS
          </span>
        </div>
      </div>

      {/* Visited Order Output Strip */}
      {currentSnapshot.visitedOrder.length > 0 && (
        <div className="viewport-visited-strip">
          <span className="visited-strip-label">TRAVERSAL OUTPUT</span>
          <div className="visited-strip-items">
            {currentSnapshot.visitedOrder.map((id, i) => (
              <span key={id} className="visited-chip">
                <small>{i + 1}</small> {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Docked Bottom-Center Viewport Transport & Narration HUD */}
      <div className="viewport-hud-dock">
        <button
          type="button"
          className={`hud-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          title="Play / Pause Trace Execution (Spacebar)"
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <div className="hud-step-readout" role="status" aria-live="polite">
          <span className="hud-step-index">STEP {currentSnapshot.stepIndex}</span>
          <span className="hud-narration-text">{currentSnapshot.narration}</span>
        </div>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{ position: [9, 7.5, 11], fov: 42, near: 0.1, far: 200 }}
        onPointerMissed={() => selectObject(null)}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
}
