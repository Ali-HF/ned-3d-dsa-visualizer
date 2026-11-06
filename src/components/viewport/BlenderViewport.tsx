import { useMemo, useRef, useState } from 'react';
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
import type { CameraPreset, SceneObjectInfo, TraceStateSnapshot } from '../../types/trace';
import { CameraController } from './CameraController';
import { DirectedEdge3D } from './DirectedEdge3D';
import { formatRefLabel } from '../../engine/traceEngine';
import {
  IconChevronDown,
  IconCube,
  IconGrid,
  IconSolid,
  IconTarget,
  IconWireframe,
} from '../icons/StudioIcons';

interface NodeMeshProps {
  obj: SceneObjectInfo;
  selected: boolean;
  wireframe: boolean;
  uiMode: 'standard' | 'pro';
  snapshot: TraceStateSnapshot;
  hasActiveHighlight: boolean;
  onSelect: (id: string) => void;
}

function SceneObjectMesh({
  obj,
  selected,
  wireframe,
  uiMode,
  snapshot,
  hasActiveHighlight,
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
  const isDoneItem = snapshot.isDone || visitOrderIndex >= 0;

  const isInvolvedInCurrentStep =
    isCompared || isSwapped || isSpawned || isActiveVisit;

  // Dim non-involved bars when an active comparison/swap/write/visit is happening
  const isDimmed = hasActiveHighlight && !isInvolvedInCurrentStep;

  let fillColor =
    obj.kind === 'array-cell'
      ? '#3d6cb9'
      : obj.kind === 'list-node'
        ? '#2e8b6e'
        : '#6c5ce7';
  let statusIcon = '';

  if (isSwapped) {
    fillColor = '#9b51e0'; // Purple for swapping
    statusIcon = '⇄';
  } else if (isCompared) {
    fillColor = '#eab308'; // Yellow for comparing
    statusIcon = '?';
  } else if (isSpawned) {
    fillColor = '#0ea5e9'; // Bright sky/teal for writing
    statusIcon = '✎';
  } else if (isActiveVisit || isDoneItem) {
    fillColor = '#22c55e'; // Green for done / visited
    statusIcon = '✓';
  } else if (isDimmed) {
    fillColor = '#252b36';
  }

  const outlineColor = selected
    ? '#ff8c1a'
    : isSwapped
      ? '#d8b4fe'
      : isCompared
        ? '#fef08a'
        : isDoneItem
          ? '#86efac'
          : '#1f2329';

  const cellIndex =
    typeof obj.fields.index === 'number' ? obj.fields.index + 1 : 1;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const step = Math.min(1, delta * 14);

    if (isArrayCell) {
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
        valueTextRef.current.position.y = barMeshRef.current.scale.y + 0.45;
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
          {/* Base pedestal */}
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[1.36, 0.06, 1.36]} />
            <meshStandardMaterial
              color={selected ? '#382a1e' : '#20232a'}
              roughness={0.7}
              metalness={0.2}
            />
            <Edges color={selected ? '#ff8c1a' : '#323844'} />
          </mesh>

          {/* Yellow Ring for Comparing or Purple Ring for Swapping */}
          {(isCompared || isSwapped || isDoneItem) && (
            <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.72, 0.88, 32]} />
              <meshBasicMaterial
                color={
                  isSwapped ? '#c084fc' : isCompared ? '#fde047' : '#4ade80'
                }
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Main Bar */}
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
              roughness={isDimmed ? 0.75 : 0.32}
              metalness={isDimmed ? 0.08 : 0.18}
              transparent={isDimmed}
              opacity={isDimmed ? 0.45 : 1}
              wireframe={wireframe}
            />
            <Edges color={outlineColor} />
          </mesh>

          {/* Top Cap */}
          <mesh ref={capMeshRef} position={[0, targetHeight + 0.08, 0]}>
            <boxGeometry args={[1.1, 0.04, 1.1]} />
            <meshStandardMaterial
              color={
                selected
                  ? '#ff9f38'
                  : isSwapped
                    ? '#e9d5ff'
                    : isCompared
                      ? '#fef08a'
                      : isDoneItem
                        ? '#86efac'
                        : '#7b93b8'
              }
              roughness={0.25}
              metalness={0.55}
            />
          </mesh>

          {/* Value + Icon Badge always facing camera */}
          <group ref={valueTextRef} position={[0, targetHeight + 0.45, 0]}>
            <Html center distanceFactor={15} zIndexRange={[5, 0]}>
              <div className={`stage-bar-label ${isDimmed ? 'dimmed' : ''}`}>
                {statusIcon && (
                  <span
                    className={`stage-bar-icon ${
                      isSwapped
                        ? 'swapping'
                        : isCompared
                          ? 'comparing'
                          : isSpawned
                            ? 'writing'
                            : 'done'
                    }`}
                  >
                    {statusIcon}
                  </span>
                )}
                <span className="stage-bar-val">{String(obj.value)}</span>
              </div>
            </Html>
          </group>

          {/* Small position number underneath in Standard Mode; full arr[i] + hex in Pro Mode */}
          <Html
            position={[0, 0.08, 0.92]}
            center
            distanceFactor={15}
            zIndexRange={[4, 0]}
          >
            {uiMode === 'standard' ? (
              <span className={`stage-pos-num ${isDimmed ? 'dimmed' : ''}`}>
                {cellIndex}
              </span>
            ) : (
              <span className="stage-pro-addr">
                {obj.label} <small>{obj.memoryAddress}</small>
              </span>
            )}
          </Html>
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

          <Html position={[0, 0.82, 0]} center distanceFactor={15} zIndexRange={[5, 0]}>
            <div className="stage-bar-label">
              <span className="stage-bar-val">{String(obj.value)}</span>
            </div>
          </Html>

          {uiMode === 'pro' && (
            <Html
              position={[0, -0.78, 0.35]}
              center
              distanceFactor={15}
              zIndexRange={[4, 0]}
            >
              <span className="stage-pro-addr">
                {obj.label} <small>{obj.memoryAddress}</small>
              </span>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

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
      fromObj.position[1] * 2 + 0.9,
      fromObj.position[2],
    );
    const end = new THREE.Vector3(
      toObj.position[0],
      toObj.position[1] * 2 + 0.9,
      toObj.position[2],
    );
    const mid = start.clone().lerp(end, 0.5);
    mid.y = Math.max(start.y, end.y) + (mode === 'swap' ? 1.25 : 0.85);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts = curve.getPoints(28).map((p) => [p.x, p.y, p.z] as [number, number, number]);
    return {
      points: pts,
      midPoint: [mid.x, mid.y + 0.25, mid.z] as [number, number, number],
    };
  }, [fromObj, toObj, mode]);

  const color = mode === 'swap' ? '#a855f7' : '#eab308';

  return (
    <group>
      <Line points={points} color={color} lineWidth={3} />
      <Html position={midPoint} center distanceFactor={15} zIndexRange={[6, 0]}>
        <span className={`stage-arc-pill ${mode}`}>
          {mode === 'swap' ? '⇄ Swapping' : '? Comparing'}
        </span>
      </Html>
    </group>
  );
}

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
  const uiMode = useViewportStore((s) => s.uiMode);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);

  const objectList = Object.values(sceneObjects);

  const hasActiveHighlight = Boolean(
    currentSnapshot.comparedRefs !== null ||
      currentSnapshot.swappedRefs !== null ||
      currentSnapshot.spawnedRef !== null ||
      currentSnapshot.activeVisitId !== null,
  );

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
      <ambientLight intensity={0.76} />
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
          {uiMode === 'pro' && <WorldOriginAxes />}
        </>
      )}

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
        <InteractionArc3D fromObj={comparePair.a} toObj={comparePair.b} mode="compare" />
      )}
      {swapPair && (
        <InteractionArc3D fromObj={swapPair.a} toObj={swapPair.b} mode="swap" />
      )}

      {objectList.map((obj) => (
        <SceneObjectMesh
          key={obj.id}
          obj={obj}
          selected={selectedId === obj.id}
          wireframe={wireframe}
          uiMode={uiMode}
          snapshot={currentSnapshot}
          hasActiveHighlight={hasActiveHighlight}
          onSelect={(id) => selectObject(id)}
        />
      ))}

      <GizmoHelper
        alignment="bottom-right"
        margin={uiMode === 'standard' ? [48, 48] : [62, 62]}
      >
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
  const uiMode = useViewportStore((s) => s.uiMode);
  const previewScene = useViewportStore((s) => s.previewScene);
  const activeMetadata = useViewportStore((s) => s.activeMetadata);
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
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [colorsPopoverOpen, setColorsPopoverOpen] = useState(false);

  const currentArrayValues = currentSnapshot.arrays.arr?.values ?? [];
  const showSortedResultLine =
    previewScene === 'array' &&
    activeMetadata.category === 'sorting' &&
    currentSnapshot.isDone &&
    currentArrayValues.length > 0;

  return (
    <div className="viewport-container">
      {/* Pro Mode Only: Full CAD Viewport Header Toolbar */}
      {uiMode === 'pro' && (
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
      )}

      {/* 3D Canvas Stage */}
      <div className="viewport-canvas-stage">
        {/* Step 4: Clean floating stage controls (View menu + What do the colours mean? popover) */}
        <div className="stage-floating-controls">
          <div className="stage-popover-anchor">
            <button
              type="button"
              className="stage-pill-btn"
              onClick={() => {
                setColorsPopoverOpen((v) => !v);
                setViewMenuOpen(false);
              }}
            >
              <span className="pill-q-mark">?</span>
              <span>What do the colours mean?</span>
            </button>

            {colorsPopoverOpen && (
              <div className="stage-popover-card" role="dialog" aria-label="Colour Legend">
                <div className="legend-popover-row">
                  <span className="legend-badge comparing">?</span>
                  <div>
                    <strong>Comparing</strong>
                    <p>Yellow ring &amp; question mark — checking two numbers</p>
                  </div>
                </div>
                <div className="legend-popover-row">
                  <span className="legend-badge swapping">⇄</span>
                  <div>
                    <strong>Swapping</strong>
                    <p>Purple &amp; arrows — trading places</p>
                  </div>
                </div>
                <div className="legend-popover-row">
                  <span className="legend-badge writing">✎</span>
                  <div>
                    <strong>Writing</strong>
                    <p>Blue &amp; pencil — saving a number into a slot</p>
                  </div>
                </div>
                <div className="legend-popover-row">
                  <span className="legend-badge done">✓</span>
                  <div>
                    <strong>Done</strong>
                    <p>Green &amp; check mark — locked in its final place</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="stage-popover-anchor">
            <button
              type="button"
              className="stage-pill-btn"
              onClick={() => {
                setViewMenuOpen((v) => !v);
                setColorsPopoverOpen(false);
              }}
            >
              <span>View</span>
              <IconChevronDown />
            </button>

            {viewMenuOpen && (
              <div className="stage-dropdown-menu" role="menu" aria-label="View Menu">
                <button
                  type="button"
                  className="stage-menu-item"
                  onClick={() => {
                    triggerCameraPreset('isometric');
                    setViewMenuOpen(false);
                  }}
                >
                  Reset view
                </button>
                <button
                  type="button"
                  className="stage-menu-item"
                  onClick={() => {
                    triggerCameraPreset('top');
                    setViewMenuOpen(false);
                  }}
                >
                  Top view
                </button>
                <button
                  type="button"
                  className="stage-menu-item"
                  onClick={() => {
                    triggerCameraPreset('front');
                    setViewMenuOpen(false);
                  }}
                >
                  Side view
                </button>
                <div className="stage-menu-divider" />
                <button
                  type="button"
                  className="stage-menu-item"
                  onClick={() => {
                    toggleAutoFollowCamera();
                    setViewMenuOpen(false);
                  }}
                >
                  <span>Follow the action</span>
                  <strong className={autoFollowCamera ? 'state-on' : 'state-off'}>
                    {autoFollowCamera ? 'On' : 'Off'}
                  </strong>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pro Mode Only: Camera / Objects / Active Status Line */}
        {uiMode === 'pro' && (
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
          </div>
        )}

        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [9, 7.5, 11], fov: 42, near: 0.1, far: 200 }}
          onPointerMissed={() => {
            selectObject(null);
            setViewMenuOpen(false);
            setColorsPopoverOpen(false);
          }}
        >
          <SceneContents />
        </Canvas>
      </div>

      {/* STEP 1 + STEP 5: Plain-English Caption Bar (19px) + Final Sorted Result Line */}
      <div className="stage-caption-bar" role="status" aria-live="polite">
        <div className="stage-caption-content">
          <p className="stage-caption-sentence">{currentSnapshot.narration}</p>
          {showSortedResultLine && (
            <p className="stage-caption-result">
              Sorted: <strong>{currentArrayValues.join(', ')}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
