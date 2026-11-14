/// <reference types="vite/client" />

declare module 'three-stdlib' {
  import type * as THREE from 'three';
  export class OrbitControls {
    object: THREE.Camera;
    domElement: HTMLElement;
    enabled: boolean;
    target: THREE.Vector3;
    minDistance: number;
    maxDistance: number;
    enableDamping: boolean;
    dampingFactor: number;
    update(): boolean;
    dispose(): void;
  }
}


