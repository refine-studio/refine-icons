// Reads and writes the one shape every drawing in icons/ has: a root svg with the set's defaults, then flat paths.

/** The defaults every drawing sets on its root svg. A path repeats one only to override it. */
export const ROOT_DEFAULTS = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

/**
 * Turns a camelCase React prop such as strokeWidth into the SVG attribute stroke-width.
 */
const toAttributeName = (name) => {
  return name.replaceAll(/[A-Z]/g, (letter) => {
    return `-${letter.toLowerCase()}`;
  });
};

/**
 * Turns a kebab-case SVG attribute name into the camelCase React prop.
 */
const toPropName = (name) => {
  return name.replaceAll(/-(\w)/g, (_, letter) => {
    return letter.toUpperCase();
  });
};

/**
 * Reads the attributes of one SVG tag into a plain object.
 */
const parseAttributes = (source) => {
  return Object.fromEntries(
    [...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => {
      return [name, value];
    }),
  );
};

/**
 * Escapes a value for a double-quoted SVG attribute.
 */
const escapeAttribute = (value) => {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
};

/**
 * Writes one drawing from its viewBox and its paths' React props.
 */
export const serializeIcon = (viewBox, paths) => {
  const [, , width, height] = viewBox.split(' ');
  const rootAttributes = Object.entries(ROOT_DEFAULTS)
    .map(([name, value]) => {
      return ` ${name}="${value}"`;
    })
    .join('');
  const pathLines = paths.map((path) => {
    const attributes = Object.entries(path)
      .map(([name, value]) => {
        return ` ${toAttributeName(name)}="${escapeAttribute(value)}"`;
      })
      .join('');
    return `  <path${attributes}/>`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}"${rootAttributes}>`,
    ...pathLines,
    '</svg>',
    '',
  ].join('\n');
};

/**
 * Reads one drawing back into its viewBox and its paths' React props. It refuses a drawing that leaves the set's shape.
 */
export const parseIcon = (name, source) => {
  const root = source.match(/<svg\b([^>]*)>/);
  if (!root) throw new Error(`${name}.svg has no svg root.`);

  const rootAttributes = parseAttributes(root[1]);
  for (const [attribute, value] of Object.entries(ROOT_DEFAULTS)) {
    if (rootAttributes[attribute] !== value) {
      throw new Error(`${name}.svg must set ${attribute}="${value}" on its root svg.`);
    }
  }
  if (!rootAttributes.viewBox) throw new Error(`${name}.svg has no viewBox.`);

  const body = source.slice(root.index + root[0].length, source.lastIndexOf('</svg>'));
  const tags = [...body.matchAll(/<(\w+)\b([^>]*?)\/>/g)];
  const unknown = body.replaceAll(/<path\b[^>]*?\/>/g, '').trim();
  if (unknown) throw new Error(`${name}.svg may hold only self-closing paths, found: ${unknown.slice(0, 60)}`);

  const paths = tags.map(([, , rawAttributes]) => {
    const path = {};
    for (const [attribute, value] of Object.entries(parseAttributes(rawAttributes))) {
      const prop = toPropName(attribute);
      path[prop] = prop === 'strokeWidth' ? Number(value) : value.replaceAll('&quot;', '"').replaceAll('&amp;', '&');
    }
    if (!path.d) throw new Error(`${name}.svg has a path without d.`);
    return path;
  });

  if (paths.length === 0) throw new Error(`${name}.svg draws nothing.`);

  return { viewBox: rootAttributes.viewBox, paths };
};
