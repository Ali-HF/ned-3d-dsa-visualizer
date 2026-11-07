import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Edges,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Html,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';
import { useViewportStore } from '../../state/useViewportStore';
import type { SceneObjectInfo, TraceStateSnapshot } from '../../types/trace';
import { CameraController } from './CameraController';
import { DirectedEdge3D } from './DirectedEdge3D';
import { formatRefLabel } from '../../engine/traceEngine';

interface NodeMeshProps {
  obj: SceneObjectInfo;
  selected: boolean;
  wireframe: boolean;
  snapshot: TraceStateSnapshot;
  isPrimaryActive: boolean;
  onSelect: (id: string) => void;
}

function SceneObjectMesh({
  obj,
  selected,
  wireframe,
  snapshot,
  isPrimaryActive,
  onSelect,
}: NodeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const barMeshRef = useRef<THREE.Mesh>(null);
  const topCapRef = useRef<THREE.Mesh>(null);
  const valueTextRef = useRef<THREE.Group>(null);

  const isArrayCell = obj.kind === 'array-cell';
  const numericVal = typeof obj.value === 'number' ? obj.value : 20;
  const targetHeight = isArrayCell
    ? Math.max(0.65, Math.min(4.8, Math.abs(numericVal) / 18))
    : 1.1;

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
  const isDoneItem = snapshot.isDone;

  const isActiveBar = isCompared || isSwapped || isSpawned || isActiveVisit;

  // Match the exact dark metallic-slate & glowing amber gold bar styling from the Stitch screenshot
  let fillColor = '#1c1f26';
  let edgeColor = '#2e3340';
  let capColor = '#2e3340';

  if (isSwapped) {
    fillColor = '#2e2440';
    edgeColor = '#a855f7';
    capColor = '#c084fc';
  } else if (isCompared) {
    fillColor = '#2d2418';
    edgeColor = '#f59e0b';
    capColor = '#fbbf24';
  } else if (isSpawned) {
    fillColor = '#162c35';
    edgeColor = '#06b6d4';
    capColor = '#22d3ee';
  } else if (isActiveVisit || isDoneItem) {
    fillColor = '#162d24';
    edgeColor = '#10b981';
    capColor = '#34d399';
  } else if (selected) {
    edgeColor = '#f59e0b';
    capColor = '#f59e0b';
  }

  const cellIndex =
    typeof obj.fields.index === 'number' ? obj.fields.index : 0;
  const heightMm = Math.round(Math.abs(numericVal) * 4.2);
  const hexAddr = `0x7FF${(0x400 + cellIndex * 4).toString(16).toUpperCase()}`;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const step = Math.min(1, delta * 14);

    if (isArrayCell) {
      const targetGroupPos = new THREE.Vector3(obj.position[0], -1.2, obj.position[2]);
      if (isSwapped) {
        targetGroupPos.z += 0.25;
      }
      groupRef.current.position.lerp(targetGroupPos, step);

      if (barMeshRef.current) {
        barMeshRef.current.scale.y = THREE.MathUtils.lerp(
          barMeshRef.current.scale.y,
          targetHeight,
          step,
        );
        barMeshRef.current.position.y = barMeshRef.current.scale.y / 2;
      }
      if (topCapRef.current && barMeshRef.current) {
        topCapRef.current.position.y = barMeshRef.current.scale.y + 0.02;
      }
      if (valueTextRef.current && barMeshRef.current) {
        valueTextRef.current.position.y = barMeshRef.current.scale.y + 0.36;
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
      position={isArrayCell ? [obj.position[0], -1.2, obj.position[2]] : obj.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(obj.id);
      }}
    >
      {isArrayCell ? (
        <>
          {/* Main Metallic-Rough Bar */}
          <mesh
            ref={barMeshRef}
            position={[0, targetHeight / 2, 0]}
            scale={[1, targetHeight, 1]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.08, 1, 0.92]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.42}
              metalness={0.35}
              wireframe={wireframe}
            />
            <Edges color={edgeColor} lineWidth={isActiveBar ? 1.8 : 1.1} />
          </mesh>

          {/* Glowing Top Cap Bar */}
          <mesh ref={topCapRef} position={[0, targetHeight + 0.02, 0]}>
            <boxGeometry args={[1.09, 0.05, 0.93]} />
            <meshBasicMaterial color={capColor} />
          </mesh>

          {/* Top VAL Badge (hidden on primary left compared bar because the OP: CMP callout sits above it) */}
          <group ref={valueTextRef} position={[0, targetHeight + 0.36, 0]}>
            {!isPrimaryActive && (
              <Html center distanceFactor={14} zIndexRange={[5, 0]}>
                <div className={`stitch-val-badge ${isActiveBar ? 'active' : ''}`}>
                  {isActiveBar && <span className="stitch-val-dot" />}
                  <span>VAL: {String(obj.value)}</span>
                </div>
              </Html>
            )}
          </group>

          {/* Internal bottom height label + Under-bar A[i] & Hex Address */}
          <Html
            position={[0, 0.18, 0.5]}
            center
            distanceFactor={14}
            zIndexRange={[4, 0]}
          >
            <span className="stitch-bar-height">h:{heightMm}mm</span>
          </Html>

          <Html
            position={[0, -0.42, 0.2]}
            center
            distanceFactor={14}
            zIndexRange={[4, 0]}
          >
            <div className="stitch-under-bar">
              <span className={`stitch-idx-box ${isActiveBar ? 'active' : ''}`}>
                A[{cellIndex}]
              </span>
              <span className="stitch-hex-addr">{hexAddr}</span>
            </div>
          </Html>
        </>
      ) : (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.05, 1.05, 1.05]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.38}
              metalness={0.3}
              wireframe={wireframe}
            />
            <Edges color={edgeColor} lineWidth={1.6} />
          </mesh>

          <Html position={[0, 0.85, 0]} center distanceFactor={14} zIndexRange={[5, 0]}>
            <div className={`stitch-val-badge ${isActiveBar ? 'active' : ''}`}>
              {isActiveBar && <span className="stitch-val-dot" />}
              <span>VAL: {String(obj.value)}</span>
            </div>
          </Html>

          <Html
            position={[0, -0.78, 0.2]}
            center
            distanceFactor={14}
            zIndexRange={[4, 0]}
          >
            <div className="stitch-under-bar">
              <span
                className={`stitch-idx-box ${
                  isActiveBar || visitOrderIndex >= 0 ? 'active' : ''
                }`}
              >
                {obj.id}
              </span>
              <span className="stitch-hex-addr">{obj.memoryAddress}</span>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

/**
 * Technical Callout Overlay above compared/swapped bars:
 * `OP: CMP (A[0]:42 > A[1]:17) = TRUE` + `Δ +25` dimension bridge
 */
function TechnicalComparisonCallout({
  fromObj,
  toObj,
  mode,
}: {
  fromObj: SceneObjectInfo;
  toObj: SceneObjectInfo;
  mode: 'compare' | 'swap';
}) {
  const valA = typeof fromObj.value === 'number' ? fromObj.value : 0;
  const valB = typeof toObj.value === 'number' ? toObj.value : 0;
  const diff = valA - valB;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const idxA = typeof fromObj.fields.index === 'number' ? fromObj.fields.index : 0;
  const idxB = typeof toObj.fields.index === 'number' ? toObj.fields.index : 1;

  const hA =
    fromObj.kind === 'array-cell'
      ? Math.max(0.65, Math.min(4.8, Math.abs(valA) / 18)) - 1.2
      : fromObj.position[1];
  const hB =
    toObj.kind === 'array-cell'
      ? Math.max(0.65, Math.min(4.8, Math.abs(valB) / 18)) - 1.2
      : toObj.position[1];

  const topY = Math.max(hA, hB) + 0.65;
  const midX = (fromObj.position[0] + toObj.position[0]) / 2;

  const opText =
    mode === 'swap'
      ? `OP: SWP (A[${idxA}]:${valA} ↔ A[${idxB}]:${valB})`
      : `OP: CMP (A[${idxA}]:${valA} > A[${idxB}]:${valB}) = ${
          valA > valB ? 'TRUE' : 'FALSE'
        }`;

  return (
    <group>
      {/* Vertical leader lines & horizontal dimension bar */}
      <Line
        points={[
          [fromObj.position[0], hA + 0.05, fromObj.position[2]],
          [fromObj.position[0], topY - 0.15, fromObj.position[2]],
          [toObj.position[0], topY - 0.15, toObj.position[2]],
          [toObj.position[0], hB + 0.05, toObj.position[2]],
        ]}
        color="#f59e0b"
        lineWidth={1.4}
      />

      {/* Main OP: CMP Callout Box above first bar */}
      <Html
        position={[fromObj.position[0] + 0.25, topY + 0.35, fromObj.position[2]]}
        center
        distanceFactor={14}
        zIndexRange={[8, 0]}
      >
        <div className="stitch-op-callout">{opText}</div>
      </Html>

      {/* Delta pill on the horizontal bridge */}
      <Html
        position={[midX, topY - 0.15, fromObj.position[2]]}
        center
        distanceFactor={14}
        zIndexRange={[7, 0]}
      >
        <span className="stitch-delta-pill">Δ {diffStr}</span>
      </Html>
    </group>
  );
}

function StitchCoordinateAxes() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Glowing Crimson Horizontal X-Axis */}
      <Line
        points={[
          [-40, 0, 0],
          [40, 0, 0],
        ]}
        color="#ef4444"
        lineWidth={1.5}
      />
      {/* Glowing Emerald Vertical Y-Axis */}
      <Line
        points={[
          [0, -20, 0],
          [0, 20, 0],
        ]}
        color="#10b981"
        lineWidth={1.5}
      />
      {/* Glowing Emerald Depth Z-Axis */}
      <Line
        points={[
          [0, 0, -40],
          [0, 0, 40],
        ]}
        color="#10b981"
        lineWidth={1.2}
      />
    </group>
  );
}

function Blender3DCursor() {
  return (
    <Html position={[0, -0.5, 0]} center zIndexRange={[6, 0]}>
      <div className="blender-3d-cursor" aria-hidden="true">
        <span className="b3d-ring" />
        <span className="b3d-tick top" />
        <span className="b3d-tick bottom" />
        <span className="b3d-tick left" />
        <span className="b3d-tick right" />
      </div>
    </Html>
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

  const primaryActiveId = swapPair?.a.id ?? comparePair?.a.id ?? null;

  return (
    <>
      <color attach="background" args={['#111215']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 16, 12]} intensity={1.1} />
      <directionalLight position={[-10, -6, -8]} intensity={0.35} />

      <CameraController />

      {showGrid && (
        <>
          {/* Ground & Backplane Technical Grid */}
          <Grid
            position={[0, -1.2, 0]}
            args={[60, 60]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#181a20"
            sectionSize={2.5}
            sectionThickness={1.0}
            sectionColor="#22252e"
            fadeDistance={38}
            fadeStrength={1.5}
            infiniteGrid
          />
          <Grid
            position={[0, 1.2, -1.5]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[32, 16]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#17191f"
            sectionSize={2.5}
            sectionThickness={0.9}
            sectionColor="#20232b"
            fadeDistance={22}
            fadeStrength={1.6}
          />
          <StitchCoordinateAxes />
        </>
      )}

      <Blender3DCursor />

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

      {comparePair && (
        <TechnicalComparisonCallout
          fromObj={comparePair.a}
          toObj={comparePair.b}
          mode="compare"
        />
      )}
      {swapPair && (
        <TechnicalComparisonCallout
          fromObj={swapPair.a}
          toObj={swapPair.b}
          mode="swap"
        />
      )}

      {objectList.map((obj) => (
        <SceneObjectMesh
          key={obj.id}
          obj={obj}
          selected={selectedId === obj.id}
          wireframe={wireframe}
          snapshot={currentSnapshot}
          isPrimaryActive={obj.id === primaryActiveId}
          onSelect={(id) => selectObject(id)}
        />
      ))}

      <GizmoHelper alignment="top-right" margin={[54, 54]}>
        <GizmoViewport
          axisColors={['#ef4444', '#10b981', '#3b82f6']}
          labelColor="#111215"
        />
      </GizmoHelper>
    </>
  );
}

export function BlenderViewport() {
  const previewScene = useViewportStore((s) => s.previewScene);
  const activeMetadata = useViewportStore((s) => s.activeMetadata);
  const selectObject = useViewportStore((s) => s.selectObject);
  const currentStep = useViewportStore((s) => s.currentStep);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);

  const sceneFileName = `${activeMetadata.title.replace(/[^a-zA-Z0-9]/g, '')}.scene`;
  const stepPadded = String(currentStep).padStart(3, '0');

  const currentArrayValues = currentSnapshot.arrays.arr?.values ?? [];
  const showSortedResultLine =
    previewScene === 'array' &&
    activeMetadata.category === 'sorting' &&
    currentSnapshot.isDone &&
    currentArrayValues.length > 0;

  return (
    <div className="viewport-container">
      {/* 3D Canvas Stage */}
      <div className="viewport-canvas-stage">
        {/* Top-Left Stitch Viewport HUD Pills */}
        <div className="stitch-top-hud">
          <div className="stitch-hud-pill">
            <span className="hud-cam-mode">Top-Orthographic</span>
            <span className="hud-scene-name">{sceneFileName}</span>
          </div>

          <div className="stitch-hud-pill telemetry">
            <span>
              SHADING: <strong>METALLIC_ROUGH</strong>
            </span>
            <span className="hud-sep">|</span>
            <span>
              FOV: <strong className="cyan">55.0mm</strong>
            </span>
            <span className="hud-sep">|</span>
            <span>
              FPS: <strong className="green">60.0</strong>
            </span>
          </div>
        </div>

        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 1.2, 11.5], fov: 40, near: 0.1, far: 200 }}
          onPointerMissed={() => selectObject(null)}
        >
          <SceneContents />
        </Canvas>

        {/* Bottom-Center Floating [DBG] Console & Plain-English Caption Bar */}
        <div className="stitch-bottom-hud" role="status" aria-live="polite">
          <div className="stitch-dbg-console">
            <span className="dbg-tag">[DBG]</span>
            <span className="dbg-chevron">&gt;</span>
            <span className="dbg-step">EXEC_STEP:{stepPadded}</span>
            <span className="dbg-sep">|</span>
            <span className="dbg-narration">{currentSnapshot.narration}</span>
            {showSortedResultLine && (
              <span className="dbg-sorted">
                [Sorted: {currentArrayValues.join(', ')}]
              </span>
            )}
            <span className="dbg-metric">
              Δt: <strong>0.42ms</strong>
            </span>
            <span className="dbg-metric">
              CYCLES: <strong>{currentStep + 6}</strong>
            </span>
            <span className="dbg-live">
              <i className="live-dot" /> LIVE_SIM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
