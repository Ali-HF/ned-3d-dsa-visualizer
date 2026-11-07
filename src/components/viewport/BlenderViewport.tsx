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
  const valueTextRef = useRef<THREE.Group>(null);

  const isArrayCell = obj.kind === 'array-cell';
  const numericVal = typeof obj.value === 'number' ? obj.value : 20;
  const targetHeight = isArrayCell
    ? Math.max(0.6, Math.min(4.8, Math.abs(numericVal) / 22))
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
  const isDoneItem = snapshot.isDone || visitOrderIndex >= 0;

  const isInvolvedInCurrentStep =
    isCompared || isSwapped || isSpawned || isActiveVisit;

  const isDimmed = hasActiveHighlight && !isInvolvedInCurrentStep;

  // Algorithm Studio DCC Semantic Palette + Clay Default
  let fillColor = '#b8bac2';
  let statusIcon = '';

  if (isSwapped) {
    fillColor = '#6366f1'; // Secondary: Electric Indigo
    statusIcon = '⇄';
  } else if (isCompared) {
    fillColor = '#f59e0b'; // Primary: Amber Gold
    statusIcon = '?';
  } else if (isSpawned) {
    fillColor = '#06b6d4'; // Tertiary: Signal Cyan
    statusIcon = '✎';
  } else if (isActiveVisit || isDoneItem) {
    fillColor = '#10b981'; // Axis Y / Done: Vibrant Emerald
    statusIcon = '✓';
  } else if (isDimmed) {
    fillColor = '#6e717a';
  }

  const outlineColor = selected
    ? '#f59e0b'
    : isSwapped
      ? '#c0c1ff'
      : isCompared
        ? '#ffc174'
        : isSpawned
          ? '#54ddfc'
          : isDoneItem
            ? '#6ee7b7'
            : '';

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
        barMeshRef.current.position.y = barMeshRef.current.scale.y / 2;
      }
      if (valueTextRef.current && barMeshRef.current) {
        valueTextRef.current.position.y = barMeshRef.current.scale.y + 0.38;
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
          <mesh
            ref={barMeshRef}
            position={[0, targetHeight / 2, 0]}
            scale={[1, targetHeight, 1]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.15, 1, 1.15]} />
            <meshLambertMaterial color={fillColor} wireframe={wireframe} />
            {outlineColor && <Edges color={outlineColor} lineWidth={1.8} />}
          </mesh>

          <group ref={valueTextRef} position={[0, targetHeight + 0.38, 0]}>
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

          <Html
            position={[0, 0.06, 0.85]}
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
            <boxGeometry args={[1.1, 1.1, 1.1]} />
            <meshLambertMaterial color={fillColor} wireframe={wireframe} />
            {outlineColor && <Edges color={outlineColor} lineWidth={1.8} />}
          </mesh>

          <Html position={[0, 0.88, 0]} center distanceFactor={15} zIndexRange={[5, 0]}>
            <div className="stage-bar-label">
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

  const color = mode === 'swap' ? '#6366f1' : '#f59e0b';

  return (
    <group>
      <Line points={points} color={color} lineWidth={2.5} />
      <Html position={midPoint} center distanceFactor={15} zIndexRange={[6, 0]}>
        <span className={`stage-arc-pill ${mode}`}>
          {mode === 'swap' ? '⇄ Swapping' : '? Comparing'}
        </span>
      </Html>
    </group>
  );
}

function BlenderGroundAxes() {
  return (
    <group position={[0, 0.008, 0]}>
      {/* Axis X: Vibrant Crimson (#ef4444) */}
      <Line
        points={[
          [-45, 0, 0],
          [45, 0, 0],
        ]}
        color="#ef4444"
        lineWidth={1.6}
      />
      {/* Axis Y: Vibrant Emerald (#10b981) */}
      <Line
        points={[
          [0, 0, -45],
          [0, 0, 45],
        ]}
        color="#10b981"
        lineWidth={1.6}
      />
    </group>
  );
}

function Blender3DCursor() {
  return (
    <Html position={[0, 0.55, 0.58]} center zIndexRange={[3, 0]}>
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

function BlenderSceneCameraRig() {
  const apex: [number, number, number] = [-6.8, 2.3, 3.2];
  const tl: [number, number, number] = [-4.2, 3.1, 1.4];
  const tr: [number, number, number] = [-3.4, 3.1, 2.9];
  const br: [number, number, number] = [-3.4, 1.5, 2.9];
  const bl: [number, number, number] = [-4.2, 1.5, 1.4];

  const triangleGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -4.12, 3.25, 1.55,
      -3.48, 3.25, 2.75,
      -3.8, 4.15, 2.15,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      <Line points={[tl, tr, br, bl, tl]} color="#f59e0b" lineWidth={1.6} />
      <Line points={[apex, tl]} color="#f59e0b" lineWidth={1.5} />
      <Line points={[apex, tr]} color="#f59e0b" lineWidth={1.5} />
      <Line points={[apex, br]} color="#f59e0b" lineWidth={1.5} />
      <Line points={[apex, bl]} color="#f59e0b" lineWidth={1.5} />
      <mesh geometry={triangleGeom}>
        <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
      </mesh>
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
      <color attach="background" args={['#393939']} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[10, 22, 14]} intensity={0.95} />
      <directionalLight position={[-14, 8, -10]} intensity={0.28} />

      <CameraController />

      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[80, 80]}
            cellSize={1}
            cellThickness={0.6}
            cellColor="#474747"
            sectionSize={10}
            sectionThickness={1.1}
            sectionColor="#565656"
            fadeDistance={60}
            fadeStrength={1.4}
            infiniteGrid
          />
          <BlenderGroundAxes />
        </>
      )}

      <BlenderSceneCameraRig />
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

      <GizmoHelper alignment="top-right" margin={[58, 58]}>
        <GizmoViewport
          axisColors={['#ef4444', '#10b981', '#3b82f6']}
          labelColor="#121316"
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
        {/* Floating HUD Badges (Algorithm Studio Level 4 Surface) */}
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
                    <p>Amber gold &amp; question mark — checking two items</p>
                  </div>
                </div>
                <div className="legend-popover-row">
                  <span className="legend-badge swapping">⇄</span>
                  <div>
                    <strong>Swapping</strong>
                    <p>Electric indigo &amp; arrows — trading places</p>
                  </div>
                </div>
                <div className="legend-popover-row">
                  <span className="legend-badge writing">✎</span>
                  <div>
                    <strong>Writing</strong>
                    <p>Signal cyan &amp; pencil — saving a number into a slot</p>
                  </div>
                </div>
                <div className="legend-popover-row">
                  <span className="legend-badge done">✓</span>
                  <div>
                    <strong>Done</strong>
                    <p>Emerald green &amp; check mark — locked in place</p>
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
                  <span>Reset view</span>
                  <kbd>0</kbd>
                </button>
                <button
                  type="button"
                  className="stage-menu-item"
                  onClick={() => {
                    triggerCameraPreset('top');
                    setViewMenuOpen(false);
                  }}
                >
                  <span>Top view</span>
                  <kbd>7</kbd>
                </button>
                <button
                  type="button"
                  className="stage-menu-item"
                  onClick={() => {
                    triggerCameraPreset('front');
                    setViewMenuOpen(false);
                  }}
                >
                  <span>Side view</span>
                  <kbd>1</kbd>
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
                  <span
                    className={`dcc-switch ${autoFollowCamera ? 'checked' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="dcc-switch-thumb" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pro Mode Only: Floating HUD Telemetry Badge */}
        {uiMode === 'pro' && (
          <div className="viewport-telemetry-overlay" aria-label="Viewport Overlay Info">
            <div className="vt-row">
              <span className="vt-key">CAM</span>
              <span className="vt-val">{cameraPreset.toUpperCase()}</span>
              <span className="vt-sep">|</span>
              <span className="vt-key">MESHES</span>
              <span className="vt-val">{Object.keys(sceneObjects).length}</span>
              <span className="vt-sep">|</span>
              <span className="vt-key">ACTIVE</span>
              <span className="vt-val accent">{selectedId ?? 'NONE'}</span>
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

      {/* Plain-English Caption Bar + Final Sorted Result Line */}
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
