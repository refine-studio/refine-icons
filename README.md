# 🎨 refine-icons

Refine icons: one drawing per icon, built into an SVG sprite and React icons ([RS-2014](https://bumg.atlassian.net/browse/RS-2014)).

```sh
pnpm add @refine-studio/refine-icons
```

## 🧩 Use

| You want                     | Import                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------ |
| One React icon               | `import { RefineIconArrowDownLG } from '@refine-studio/refine-icons'`          |
| An icon by its name, in data | `import { REFINE_ICON_NAMES } from '@refine-studio/refine-icons/names'`        |
| The name type                | `import type { IconName } from '@refine-studio/refine-icons'`                  |
| The sprite                   | `@refine-studio/refine-icons/sprite.svg`, then `<use href="…#Arrow_Down_LG"/>` |
| One drawing                  | `@refine-studio/refine-icons/icons/Arrow_Down_LG.svg`                          |

A React icon takes `size` (24), `strokeWidth` (2), `className` and any SVG prop. It draws in `currentColor`. A path with its own stroke width scales with the icon's.

## ✏️ Add an icon

1. Draw it on the set's grid at a 2px line, round caps and joins, in `currentColor`.
2. Save it as `icons/<Name_Like_This>.svg`, with the root defaults every drawing has (`fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`) and flat `<path/>`s only. The build refuses anything else.
3. `pnpm test`, then open a pull request.

## 🛠️ Develop

Node 24 (`nvm use`), pnpm.

| Script           | Does                                                          |
| ---------------- | ------------------------------------------------------------- |
| `pnpm generate`  | `icons/*.svg` → `src/generated/` (React icons, names, sprite) |
| `pnpm build`     | generate, then `dist/`                                        |
| `pnpm typecheck` | generate, then `tsc`                                          |
| `pnpm lint`      | ESLint and Prettier                                           |
| `pnpm test`      | generate, then Vitest                                         |

`test/refine-ui-icons.json` holds Refine UI's own path props. The test proves every icon drawn at 1.75 matches them. `scripts/import-refine-ui-icons.mjs` wrote both from refine-ui's `src/icons/refine-icons.ts`.

## 🚀 Release

Bump `version` in `package.json`, merge, then push a `v<version>` tag. `release.yml` publishes to npm through trusted publishing (no token) and opens a GitHub release.

## ⚖️ Licence

MIT
