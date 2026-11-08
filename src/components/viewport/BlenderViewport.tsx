import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Billboard,
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
  swapPartner: SceneObjectInfo | null;
  swapDirection: 1 | -1;
  uiMode: 'kids' | 'standard' | 'pro';
  onSelect: (id: string) => void;
}

function SceneObjectMesh({
  obj,
  selected,
  wireframe,
  snapshot,
  isPrimaryActive,
  swapPartner,
  swapDirection,
  uiMode,
  onSelect,
}: NodeMeshProps) {
  const isKids = uiMode === 'kids';
  const groupRef = useRef<THREE.Group>(null);
  const barMeshRef = useRef<THREE.Mesh>(null);
  const valueTextRef = useRef<THREE.Group>(null);
  const swapProgressRef = useRef(1);
  const lastSwapStepRef = useRef(-1);

  const isArrayCell = obj.kind === 'array-cell';
  const isStackSlab =
    obj.kind === 'stack-slab' ||
    obj.id.startsWith('stk-') ||
    obj.id.startsWith('stack-');
  const isHashBucket = obj.id.startsWith('b-');
  const isTopSlab =
    isStackSlab &&
    !isHashBucket &&
    !snapshot.edges.some((e) => e.to === obj.id && e.label === 'below') &&
    Object.keys(snapshot.nodes).length > 0;
  const isQueueNode =
    obj.id.startsWith('q-') ||
    obj.id.startsWith('cq-') ||
    obj.id.startsWith('dq-');
  const isListNode = obj.id.startsWith('node-') || obj.id.startsWith('ll-');
  const hasIncomingNext = snapshot.edges.some(
    (e) =>
      e.to === obj.id &&
      (e.label === 'next' || e.label === 'wrap % N' || !e.label),
  );
  const hasOutgoingNext = snapshot.edges.some(
    (e) =>
      e.from === obj.id &&
      (e.label === 'next' || e.label === 'wrap % N' || !e.label),
  );
  const nodeCount = Object.keys(snapshot.nodes).length;
  const pointerTag = isQueueNode
    ? !hasIncomingNext && !hasOutgoingNext
      ? 'FRONT / REAR'
      : !hasIncomingNext
        ? 'FRONT ▲'
        : !hasOutgoingNext && nodeCount > 1
          ? 'REAR ▼'
          : null
    : isListNode
      ? !hasIncomingNext && !hasOutgoingNext
        ? 'HEAD / TAIL'
        : !hasIncomingNext
          ? 'HEAD ▲'
          : !hasOutgoingNext && nodeCount > 1
            ? 'TAIL ▼'
            : null
      : null;
  const numericVal = typeof obj.value === 'number' ? obj.value : 20;
  const isHanoiDisk =
    Boolean(obj.fields.isHanoi) && typeof numericVal === 'number';
  const slabRadius = isHanoiDisk
    ? 0.95 + (Math.min(30, Math.max(10, numericVal)) / 30) * 0.75
    : 1.45;
  const baseMinY = isStackSlab ? 0.2 : 0.55;
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

  // Classic Blender 4.x Solid Viewport Studio Grey (#a8a8a8) with Blender Orange selection/active outlines
  let fillColor = '#a8a8a8';
  let edgeColor = '#2b2b2b';

  if (isSwapped) {
    fillColor = '#b8b0a4';
    edgeColor = '#ffa834';
  } else if (isCompared) {
    fillColor = '#b4b4b4';
    edgeColor = '#ff9f2c';
  } else if (isSpawned) {
    fillColor = '#a8b4b8';
    edgeColor = '#38bdf8';
  } else if (isActiveVisit || isDoneItem) {
    fillColor = '#a8b4ac';
    edgeColor = '#4ade80';
  } else if (selected) {
    fillColor = '#b4b4b4';
    edgeColor = '#ff9f2c';
  }

  const cellIndex =
    typeof obj.fields.index === 'number' ? obj.fields.index : 0;
  const heightMm = Math.round(Math.abs(numericVal) * 4.2);
  const hexAddr = `0x7FF${(0x400 + cellIndex * 4).toString(16).toUpperCase()}`;

  // Initialize transforms once on mount so React re-renders never snap animated refs
  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        obj.position[0],
        isArrayCell ? 0 : Math.max(baseMinY, obj.position[1]),
        obj.position[2],
      );
    }
    if (barMeshRef.current) {
      barMeshRef.current.scale.set(1, targetHeight, 1);
      barMeshRef.current.position.set(0, targetHeight / 2, 0);
    }
    if (valueTextRef.current) {
      valueTextRef.current.position.set(0, targetHeight + 0.36, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger a fresh 0 -> 1 physical swap trajectory starting from swapPartner.position
  useLayoutEffect(() => {
    if (isSwapped && swapPartner && lastSwapStepRef.current !== snapshot.stepIndex) {
      lastSwapStepRef.current = snapshot.stepIndex;
      swapProgressRef.current = 0;
      if (groupRef.current) {
        groupRef.current.position.set(
          swapPartner.position[0],
          isArrayCell ? 0 : Math.max(baseMinY, swapPartner.position[1]),
          swapPartner.position[2],
        );
      }
      if (barMeshRef.current) {
        barMeshRef.current.scale.set(1, targetHeight, 1);
        barMeshRef.current.position.set(0, targetHeight / 2, 0);
      }
      if (valueTextRef.current) {
        valueTextRef.current.position.set(0, targetHeight + 0.36, 0);
      }
    } else if (!isSwapped) {
      lastSwapStepRef.current = -1;
    }
  }, [isSwapped, swapPartner, snapshot.stepIndex, isArrayCell, targetHeight, baseMinY]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const step = Math.min(1, delta * 12);

    // Smooth 3D counter-arc swap animation between swapPartner.position -> obj.position
    if (isSwapped && swapPartner && swapProgressRef.current < 1) {
      swapProgressRef.current = Math.min(1, swapProgressRef.current + delta * 1.9);
      const t = swapProgressRef.current;
      // Cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const arc = Math.sin(t * Math.PI);

      if (isArrayCell) {
        const x = THREE.MathUtils.lerp(swapPartner.position[0], obj.position[0], ease);
        const y = arc * (swapDirection > 0 ? 0.62 : 0.32);
        const z =
          THREE.MathUtils.lerp(swapPartner.position[2], obj.position[2], ease) +
          swapDirection * arc * 1.35;
        groupRef.current.position.set(x, y, z);

        if (barMeshRef.current) {
          barMeshRef.current.scale.y = targetHeight;
          barMeshRef.current.position.y = targetHeight / 2;
        }
        if (valueTextRef.current) {
          valueTextRef.current.position.y = targetHeight + 0.36;
        }
      } else {
        const startY = Math.max(baseMinY, swapPartner.position[1]);
        const endY = Math.max(baseMinY, obj.position[1]);
        const x =
          THREE.MathUtils.lerp(swapPartner.position[0], obj.position[0], ease) +
          swapDirection * arc * 0.65;
        const y =
          THREE.MathUtils.lerp(startY, endY, ease) + swapDirection * arc * 0.48;
        const z =
          THREE.MathUtils.lerp(swapPartner.position[2], obj.position[2], ease) +
          swapDirection * arc * 0.95;
        groupRef.current.position.set(x, y, z);
      }
      return;
    }

    if (isArrayCell) {
      // Array bars stand directly on the y = 0 horizontal ground plane
      const targetGroupPos = new THREE.Vector3(obj.position[0], 0, obj.position[2]);
      groupRef.current.position.lerp(targetGroupPos, step);

      if (barMeshRef.current) {
        barMeshRef.current.scale.y = THREE.MathUtils.lerp(
          barMeshRef.current.scale.y,
          targetHeight,
          step,
        );
        barMeshRef.current.position.y = barMeshRef.current.scale.y / 2;
      }
      if (valueTextRef.current && barMeshRef.current) {
        valueTextRef.current.position.y = barMeshRef.current.scale.y + 0.36;
      }
    } else {
      const targetNodePos = new THREE.Vector3(
        obj.position[0],
        Math.max(baseMinY, obj.position[1]),
        obj.position[2],
      );
      if (isActiveVisit) {
        targetNodePos.y += Math.sin(state.clock.elapsedTime * 6) * 0.06;
      }
      groupRef.current.position.lerp(targetNodePos, step);
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(obj.id);
      }}
    >
      {isArrayCell ? (
        <>
          {/* Blender Solid Studio Grey Bar standing on the ground grid */}
          <mesh
            ref={barMeshRef}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.08, 1, 0.92]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.55}
              metalness={0.05}
              wireframe={wireframe}
            />
            <Edges
              threshold={15}
              color={edgeColor}
              lineWidth={isActiveBar || selected ? 2.2 : 1.0}
            />
          </mesh>

          {/* Top VAL Badge (visible on both bars during swap, hidden on primary left bar only during compare) */}
          <group ref={valueTextRef}>
            {(!isPrimaryActive || isSwapped) && (
              <Html center distanceFactor={14} zIndexRange={[5, 0]}>
                <div className={`stitch-val-badge ${isActiveBar ? 'active' : ''}`}>
                  {isActiveBar && <span className="stitch-val-dot" />}
                  <span>
                    {isKids ? String(obj.value) : `VAL: ${String(obj.value)}`}
                  </span>
                </div>
              </Html>
            )}
          </group>

          {/* Internal bottom height label + Under-bar A[i] & Hex Address */}
          {!isKids && (
            <Html
              position={[0, 0.18, 0.5]}
              center
              distanceFactor={14}
              zIndexRange={[4, 0]}
            >
              <span className="stitch-bar-height">h:{heightMm}mm</span>
            </Html>
          )}

          <Html
            position={[0, -0.35, 0.35]}
            center
            distanceFactor={14}
            zIndexRange={[4, 0]}
          >
            <div className="stitch-under-bar">
              <span className={`stitch-idx-box ${isActiveBar ? 'active' : ''}`}>
                {isKids ? `#${cellIndex + 1}` : `A[${cellIndex}]`}
              </span>
              {!isKids && <span className="stitch-hex-addr">{hexAddr}</span>}
            </div>
          </Html>
        </>
      ) : isStackSlab ? (
        <>
          {/* Vertical Rounded Slab (Cylinder Disk) */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[slabRadius, slabRadius, 0.42, 48]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.52}
              metalness={0.06}
              wireframe={wireframe}
            />
            <Edges
              threshold={20}
              color={edgeColor}
              lineWidth={isActiveBar || selected ? 2.4 : 1.2}
            />
          </mesh>

          {/* Front Horizontal Slab Badge: prevents vertical overlap on stacked slabs */}
          <Html
            position={[0, 0, slabRadius + 0.35]}
            center
            distanceFactor={14}
            zIndexRange={[5, 0]}
          >
            <div className={`stitch-slab-badge ${isActiveBar ? 'active' : ''}`}>
              <span
                className={`stitch-idx-box ${
                  isActiveBar || visitOrderIndex >= 0 ? 'active' : ''
                }`}
              >
                {obj.id}
              </span>
              <div className="stitch-val-badge">
                {isActiveBar && <span className="stitch-val-dot" />}
                <span>
                  {isKids ? String(obj.value) : `VAL: ${String(obj.value)}`}
                </span>
              </div>
              {!isKids && (
                <span className="stitch-hex-addr">{obj.memoryAddress}</span>
              )}
            </div>
          </Html>

          {/* Floating TOP / BUCKET Indicator above slab */}
          {(isTopSlab || isHashBucket) && (
            <Html
              position={[0, 0.42, 0]}
              center
              distanceFactor={14}
              zIndexRange={[6, 0]}
            >
              <div className="stitch-top-badge">
                {isHashBucket ? 'BUCKET ▼' : 'TOP ▲'}
              </div>
            </Html>
          )}
        </>
      ) : (
        <>
          {/* Circular Node (Sphere with contour ring) for Tree, Graph, Linked List, Queue */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.58, 32, 32]} />
            <meshStandardMaterial
              color={fillColor}
              roughness={0.48}
              metalness={0.06}
              wireframe={wireframe}
            />
          </mesh>

          {/* Blender Circular Contour / Active Selection Ring around Sphere */}
          <Billboard>
            <mesh>
              <ringGeometry
                args={[
                  0.58,
                  isActiveBar || selected ? 0.635 : 0.605,
                  48,
                ]}
              />
              <meshBasicMaterial
                color={edgeColor}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Billboard>

          {pointerTag && (
            <Html
              position={[0, 1.32, 0]}
              center
              distanceFactor={14}
              zIndexRange={[6, 0]}
            >
              <div className="stitch-top-badge">{pointerTag}</div>
            </Html>
          )}

          <Html position={[0, 0.85, 0]} center distanceFactor={14} zIndexRange={[5, 0]}>
            <div className={`stitch-val-badge ${isActiveBar ? 'active' : ''}`}>
              {isActiveBar && <span className="stitch-val-dot" />}
              <span>
                {isKids ? String(obj.value) : `VAL: ${String(obj.value)}`}
              </span>
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
              {!isKids && (
                <span className="stitch-hex-addr">{obj.memoryAddress}</span>
              )}
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
      ? Math.max(0.65, Math.min(4.8, Math.abs(valA) / 18))
      : Math.max(0.55, fromObj.position[1]) + 0.52;
  const hB =
    toObj.kind === 'array-cell'
      ? Math.max(0.65, Math.min(4.8, Math.abs(valB) / 18))
      : Math.max(0.55, toObj.position[1]) + 0.52;

  const topY = Math.max(hA, hB) + 0.65;
  const midX = (fromObj.position[0] + toObj.position[0]) / 2;

  const opText =
    mode === 'swap'
      ? `OP: SWP (${fromObj.id}:${valA} ↔ ${toObj.id}:${valB})`
      : `OP: CMP (A[${idxA}]:${valA} > A[${idxB}]:${valB}) = ${
          valA > valB ? 'TRUE' : 'FALSE'
        }`;

  const swapArcFront = useMemo(() => {
    if (mode !== 'swap') return [];
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const arc = Math.sin(t * Math.PI);
      pts.push([
        THREE.MathUtils.lerp(fromObj.position[0], toObj.position[0], t),
        THREE.MathUtils.lerp(hA * 0.55, hB * 0.55, t) + arc * 0.65,
        THREE.MathUtils.lerp(fromObj.position[2], toObj.position[2], t) + arc * 1.35,
      ]);
    }
    return pts;
  }, [mode, fromObj.position, toObj.position, hA, hB]);

  const swapArcBack = useMemo(() => {
    if (mode !== 'swap') return [];
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const arc = Math.sin(t * Math.PI);
      pts.push([
        THREE.MathUtils.lerp(toObj.position[0], fromObj.position[0], t),
        THREE.MathUtils.lerp(hB * 0.55, hA * 0.55, t) + arc * 0.35,
        THREE.MathUtils.lerp(toObj.position[2], fromObj.position[2], t) - arc * 1.35,
      ]);
    }
    return pts;
  }, [mode, fromObj.position, toObj.position, hA, hB]);

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
        color="#ff9f2c"
        lineWidth={1.5}
      />

      {mode === 'swap' && swapArcFront.length > 0 && (
        <>
          <Line points={swapArcFront} color="#ffa834" lineWidth={2.2} />
          <Line points={swapArcBack} color="#4772b3" lineWidth={1.8} />
        </>
      )}

      {/* Main OP: CMP / SWP Callout Box above first bar */}
      <Html
        position={[fromObj.position[0] + 0.25, topY + 0.35, fromObj.position[2]]}
        center
        distanceFactor={14}
        zIndexRange={[8, 0]}
      >
        <div className="stitch-op-callout">{opText}</div>
      </Html>

      {/* Delta / Swap pill on the horizontal bridge */}
      <Html
        position={[midX, topY - 0.15, fromObj.position[2]]}
        center
        distanceFactor={14}
        zIndexRange={[7, 0]}
      >
        <span className="stitch-delta-pill">
          {mode === 'swap' ? '⇄ SWAP' : `Δ ${diffStr}`}
        </span>
      </Html>
    </group>
  );
}

/**
 * Classic Blender 4.x Ground-Plane Axis Lines lying flat on the horizontal floor (y = 0.003):
 * - Red X-Axis (#9e3b42) along X
 * - Green Floor Y-Axis (#568235) along Z
 */
function BlenderGroundAxes() {
  return (
    <group>
      {/* Blender X-Axis: Muted Crimson Red on Ground Floor */}
      <Line
        points={[
          [-100, 0.003, 0],
          [100, 0.003, 0],
        ]}
        color="#9e3b42"
        lineWidth={1.6}
      />
      {/* Blender Y-Axis (Floor Depth): Muted Olive Green on Ground Floor */}
      <Line
        points={[
          [0, 0.003, -100],
          [0, 0.003, 100],
        ]}
        color="#568235"
        lineWidth={1.6}
      />
    </group>
  );
}

function Blender3DCursor() {
  return (
    <Html position={[0, 0.01, 0]} center zIndexRange={[6, 0]}>
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
  const uiMode = useViewportStore((s) => s.uiMode);

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
      {/* Exact Blender 4.x Solid Viewport Charcoal Background & Distance Fog */}
      <color attach="background" args={['#303030']} />
      <fog attach="fog" args={['#303030', 38, 120]} />

      {/* 3-Point Blender Studio Solid Lighting for Three-Tone Grey Object Shading */}
      <ambientLight intensity={0.68} />
      <hemisphereLight args={['#ffffff', '#383838', 0.55]} />
      <directionalLight position={[-8, 16, 11]} intensity={1.15} />
      <directionalLight position={[10, 6, -9]} intensity={0.35} />

      <CameraController />

      {showGrid && (
        <>
          {/* Exact Blender Horizontal Ground-Plane Infinite Subdivision Grid */}
          <Grid
            position={[0, -0.002, 0]}
            args={[160, 160]}
            cellSize={1}
            cellThickness={0.75}
            cellColor="#3d3d3d"
            sectionSize={5}
            sectionThickness={1.25}
            sectionColor="#4e4e4e"
            fadeDistance={85}
            fadeStrength={1.3}
            infiniteGrid
          />
          <BlenderGroundAxes />
        </>
      )}

      <Blender3DCursor />

      {objectList.map((obj) =>
        obj.linksTo.map((link) => {
          const target = sceneObjects[link.targetId];
          if (!target) return null;
          // For stacked slabs, do not draw an internal vertical arrow cutting through the solid slabs
          if (
            link.label === 'below' &&
            (obj.kind === 'stack-slab' || obj.id.startsWith('stk-')) &&
            (target.kind === 'stack-slab' || target.id.startsWith('stk-'))
          ) {
            return null;
          }
          const highlighted = selectedId === obj.id || selectedId === target.id;
          const bidirectional = target.linksTo.some(
            (rev) => rev.targetId === obj.id,
          );
          return (
            <DirectedEdge3D
              key={`${obj.id}->${link.targetId}-${link.label}`}
              from={[
                obj.position[0],
                Math.max(0.2, obj.position[1]),
                obj.position[2],
              ]}
              to={[
                target.position[0],
                Math.max(0.2, target.position[1]),
                target.position[2],
              ]}
              label={link.label}
              highlighted={highlighted}
              bidirectional={bidirectional}
            />
          );
        }),
      )}

      {comparePair && comparePair.a.id !== comparePair.b.id && (
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

      {objectList.map((obj) => {
        const isFirstSwap = swapPair?.a.id === obj.id;
        const isSecondSwap = swapPair?.b.id === obj.id;
        const swapPartner = isFirstSwap
          ? (swapPair?.b ?? null)
          : isSecondSwap
            ? (swapPair?.a ?? null)
            : null;
        const swapDirection: 1 | -1 = isFirstSwap ? 1 : -1;

        return (
          <SceneObjectMesh
            key={obj.id}
            obj={obj}
            selected={selectedId === obj.id}
            wireframe={wireframe}
            snapshot={currentSnapshot}
            isPrimaryActive={obj.id === primaryActiveId}
            swapPartner={swapPartner}
            swapDirection={swapDirection}
            uiMode={uiMode}
            onSelect={(id) => selectObject(id)}
          />
        );
      })}

      <GizmoHelper alignment="top-right" margin={[54, 54]}>
        <GizmoViewport
          axisColors={['#e03e4b', '#65a338', '#3c78d8']}
          labelColor="#1a1a1a"
        />
      </GizmoHelper>
    </>
  );
}

export function BlenderViewport() {
  const uiMode = useViewportStore((s) => s.uiMode);
  const previewScene = useViewportStore((s) => s.previewScene);
  const activeMetadata = useViewportStore((s) => s.activeMetadata);
  const selectObject = useViewportStore((s) => s.selectObject);
  const currentStep = useViewportStore((s) => s.currentStep);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);

  const isKids = uiMode === 'kids';
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
            <span className="hud-cam-mode">
              {isKids ? '3D Stage' : 'User Perspective'}
            </span>
            <span className="hud-scene-name">
              {isKids ? activeMetadata.title : sceneFileName}
            </span>
          </div>

          {!isKids && (
            <div className="stitch-hud-pill telemetry">
              <span>
                SHADING: <strong>SOLID_STUDIO</strong>
              </span>
              <span className="hud-sep">|</span>
              <span>
                FOV: <strong className="cyan">45.0mm</strong>
              </span>
              <span className="hud-sep">|</span>
              <span>
                FPS: <strong className="green">60.0</strong>
              </span>
            </div>
          )}

          {currentSnapshot.callStack.length > 0 && (
            <div className="stitch-hud-pill callstack" role="status">
              <span className="hud-scene-name">
                CALL_STACK [{currentSnapshot.callStack.length}]:
              </span>
              <span>
                {currentSnapshot.callStack
                  .slice(-3)
                  .map((f) => `${f.fn}(${f.args.join(',')})`)
                  .join(' → ')}
              </span>
            </div>
          )}
        </div>

        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [9, 7.2, 11], fov: 45, near: 0.1, far: 250 }}
          onPointerMissed={() => selectObject(null)}
        >
          <SceneContents />
        </Canvas>

        {/* Bottom-Center Floating [DBG] Console & Plain-English Caption Bar */}
        <div className="stitch-bottom-hud" role="status" aria-live="polite">
          <div className="stitch-dbg-console">
            {!isKids && (
              <>
                <span className="dbg-tag">[DBG]</span>
                <span className="dbg-chevron">&gt;</span>
                <span className="dbg-step">EXEC_STEP:{stepPadded}</span>
                <span className="dbg-sep">|</span>
              </>
            )}
            <span className="dbg-narration">{currentSnapshot.narration}</span>
            {showSortedResultLine && (
              <span className="dbg-sorted">
                [Sorted: {currentArrayValues.join(', ')}]
              </span>
            )}
            {!isKids && (
              <>
                <span className="dbg-metric">
                  Δt: <strong>0.42ms</strong>
                </span>
                <span className="dbg-metric">
                  CYCLES: <strong>{currentStep + 6}</strong>
                </span>
                <span className="dbg-live">
                  <i className="live-dot" /> LIVE_SIM
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
