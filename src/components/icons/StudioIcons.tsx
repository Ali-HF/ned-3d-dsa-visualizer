import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function IconPlay(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M4 2.5v11l9-5.5-9-5.5z" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M3.5 2.5h3.5v11H3.5v-11zm5.5 0h3.5v11H9v-11z" />
    </svg>
  );
}

export function IconStepBack(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M3 2.5h2v11H3v-11zm3.5 5.5 7 5.5v-11l-7 5.5z" />
    </svg>
  );
}

export function IconStepForward(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M11 2.5h2v11h-2v-11zM9.5 8 2.5 2.5v11L9.5 8z" />
    </svg>
  );
}

export function IconRestart(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M2 2.5h2v11H2v-11zm3 5.5 5-4.5v9L5 8zm5 0 5-4.5v9L10 8z" />
    </svg>
  );
}

export function IconSkipEnd(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M12 2.5h2v11h-2v-11zM11 8 6 3.5v9L11 8zM6 8 1 3.5v9L6 8z" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      {...props}
    >
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M2 6h12M2 10h12M6 2v12M10 2v12" />
    </svg>
  );
}

export function IconWireframe(props: IconProps) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      {...props}
    >
      <circle cx="8" cy="8" r="6" />
      <ellipse cx="8" cy="8" rx="3" ry="6" />
      <path d="M2.2 8h11.6" />
    </svg>
  );
}

export function IconSolid(props: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      {...props}
    >
      <circle cx="8" cy="8" r="4.5" />
      <path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15" />
    </svg>
  );
}

export function IconCube(props: IconProps) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      {...props}
    >
      <path d="M8 1.5 14 5v6l-6 3.5L2 11V5l6-3.5z" />
      <path d="M2 5l6 3.5L14 5M8 8.5V15" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      {...props}
    >
      <path d="M8 1.5 2.5 3.8v4.2c0 3.4 2.3 5.7 5.5 6.5 3.2-.8 5.5-3.1 5.5-6.5V3.8L8 1.5z" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

