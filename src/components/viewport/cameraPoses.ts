import type { CameraPreset } from '../../types/trace';

/**
 * Computes the desired camera position and look-at target for each
 * Blender-inspired camera preset.
 */
export function getCameraPoseForPreset(
  preset: CameraPreset,
  selectedPosition?: [number, number, number],
): { position: [number, number, number]; target: [number, number, number] } {
  const focusTarget: [number, number, number] = selectedPosition ?? [0, 1.5, 0];

  switch (preset) {
    case 'front':
      return { position: [0, 2.2, 13], target: [0, 1.5, 0] };
    case 'top':
      return { position: [0, 15, 0.01], target: [0, 0, 0] };
    case 'side':
      return { position: [14, 2.2, 0], target: [0, 1.5, 0] };
    case 'focus':
      return {
        position: [
          focusTarget[0] + 3.5,
          focusTarget[1] + 2.5,
          focusTarget[2] + 5.5,
        ],
        target: focusTarget,
      };
    case 'isometric':
    default:
      return { position: [9, 7.5, 11], target: [0, 1.4, 0] };
  }
}

