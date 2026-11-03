import { render } from '@testing-library/react';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { RefineIconArrowDownLG, RefineIconBell, RefineIconHeartSolid } from './index';
import { type IconName, REFINE_ICON_NAMES } from './names';

interface FixtureIcon {
  viewBox: string;
  paths: Record<string, string | number>[];
}

const fixture = JSON.parse(readFileSync(resolve('test/refine-ui-icons.json'), 'utf8')) as Record<string, FixtureIcon>;

/**
 * Reads every attribute of the rendered paths, so two icons compare by what they draw.
 */
const pathAttributes = (container: HTMLElement) => {
  return [...container.querySelectorAll('path')].map((path) => {
    return Object.fromEntries(
      [...path.attributes].map((attribute) => {
        return [attribute.name, attribute.value];
      }),
    );
  });
};

describe('Refine icons', () => {
  it('draws at a 2px stroke in currentColor', () => {
    const { container } = render(<RefineIconBell />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('stroke-width')).toBe('2');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('stroke-linecap')).toBe('round');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('width')).toBe('24');
  });

  it('takes size, strokeWidth and any SVG prop like a lucide icon', () => {
    const { container } = render(<RefineIconArrowDownLG id="arrow" size={16} strokeWidth={1} />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('stroke-width')).toBe('1');
    expect(svg?.getAttribute('width')).toBe('16');
    expect(svg?.getAttribute('id')).toBe('arrow');
    expect(svg?.getAttribute('data-icon')).toBe('Arrow_Down_LG');
    expect(svg?.getAttribute('data-slot')).toBe('icon');
  });

  it('keeps a filled icon filled in currentColor', () => {
    const { container } = render(<RefineIconHeartSolid />);

    expect(container.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
  });

  it('has every icon Refine UI ships, under the same name', () => {
    expect(Object.keys(REFINE_ICON_NAMES)).toEqual(expect.arrayContaining(Object.keys(fixture)));
    expect(REFINE_ICON_NAMES.Arrow_Down_LG).toBe(RefineIconArrowDownLG);
  });

  it('has the icons Refine UI still takes from lucide', () => {
    expect(Object.keys(REFINE_ICON_NAMES)).toEqual(expect.arrayContaining(['Sparkles', 'Diamond']));
  });

  it.each(Object.entries(fixture))('draws %s at 1.75 exactly as Refine UI does', (name, { viewBox, paths }) => {
    const Icon = REFINE_ICON_NAMES[name as IconName];
    const { container: actual } = render(<Icon strokeWidth={1.75} />);
    const { container: expected } = render(
      <svg>
        {paths.map((path) => {
          return <path key={String(path.d)} {...path} />;
        })}
      </svg>,
    );

    expect(actual.querySelector('svg')?.getAttribute('viewBox')).toBe(viewBox);
    expect(pathAttributes(actual)).toEqual(pathAttributes(expected));
  });
});

describe('Drawings and sprite', () => {
  const drawings = readdirSync(resolve('icons')).map((file) => {
    return file.slice(0, -'.svg'.length);
  });
  const sprite = readFileSync(resolve('src/generated/sprite.svg'), 'utf8');

  it('makes one React icon and one sprite symbol per drawing', () => {
    expect(Object.keys(REFINE_ICON_NAMES).sort()).toEqual([...drawings].sort());
    expect(
      [...sprite.matchAll(/<symbol id="([^"]+)"/g)]
        .map(([, id]) => {
          return id;
        })
        .sort(),
    ).toEqual([...drawings].sort());
  });

  it.each(drawings)('draws %s at a 2px line', (name) => {
    const source = readFileSync(resolve(`icons/${name}.svg`), 'utf8');

    expect(source).toMatch(/^<svg [^>]*stroke-width="2"/);
  });
});
