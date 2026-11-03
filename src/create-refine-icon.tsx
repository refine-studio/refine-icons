import type { ComponentProps, SVGProps } from 'react';

export interface RefineIconProps extends ComponentProps<'svg'> {
  size?: number | string;
}

type RefineIconPath = SVGProps<SVGPathElement>;

/** Every drawing is made at this stroke width. */
const DRAWN_STROKE_WIDTH = 2;

/**
 * Scales a path's own stroke width with the icon's, so a thicker detail stays thicker by the same ratio.
 */
const scalePathStrokeWidth = (pathStrokeWidth: RefineIconPath['strokeWidth'], strokeWidth: number | string) => {
  const scaled = (Number(pathStrokeWidth) * Number(strokeWidth)) / DRAWN_STROKE_WIDTH;

  return Number.isFinite(scaled) ? Number(scaled.toFixed(3)) : pathStrokeWidth;
};

/**
 * Builds a React icon from one drawing. It takes the same `size`, `strokeWidth` and `className` props as a lucide icon.
 */
export const createRefineIcon = (name: string, viewBox: string, paths: RefineIconPath[]) => {
  /**
   * Renders the icon in currentColor at the 2px stroke it is drawn at.
   */
  const RefineIcon = ({ size = 24, strokeWidth = DRAWN_STROKE_WIDTH, ...props }: RefineIconProps) => {
    return (
      <svg
        aria-hidden="true"
        data-icon={name}
        data-slot="icon"
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        viewBox={viewBox}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {paths.map((path) => {
          return path.strokeWidth === undefined ? (
            <path key={path.d} {...path} />
          ) : (
            <path key={path.d} {...path} strokeWidth={scalePathStrokeWidth(path.strokeWidth, strokeWidth)} />
          );
        })}
      </svg>
    );
  };

  RefineIcon.displayName = `RefineIcon${name.replaceAll('_', '')}`;

  return RefineIcon;
};
