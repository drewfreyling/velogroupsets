# Colour and theme guide

The interface uses a teal brand palette with cool, teal-tinted neutrals. Keep colour values in [global.css](../apps/web/src/styles/global.css) and use semantic Tailwind utilities in templates. The favicon is a standalone SVG and uses the same brand values.

## Brand colours

| Role | Hex | Use |
| --- | --- | --- |
| Base | `#3DCFC2` | Primary buttons, focus outlines, active indicators, logo mark and occasional highlights |
| Soft | `#9FE8E0` | Illustration fills and dark-mode link hover |
| Link | `#0B6B65` | Links, small teal text and meaningful icons on light backgrounds |
| Deep | `#08403C` | Button hover/pressed backgrounds and light-mode link hover |
| Tint | `#E2F5F3` | Light-mode selected states, callouts and illustration background |
| Brand ink | `#10201F` | Text on base teal, in either theme |

Base teal always uses dark brand ink for text; never put white text on it. Hovered/pressed primary buttons switch to deep teal with `#E6F2F0` text. Meaningful small icons inherit the link colour; the decorative logo mark uses base teal.

## Semantic colours

| Role / utility | Light | Dark |
| --- | --- | --- |
| Page / `bg-paper` | `#F3F8F7` | `#0B1514` |
| Surface / `bg-surface` | `#FFFFFF` | `#12211F` |
| Border / `border-line` | `#D3E1DF` | `#25403D` |
| Muted text / `text-muted` | `#4B5F5D` | `#8FA5A2` |
| Main text / `text-ink` | `#10201F` | `#E6F2F0` |
| Link / `text-link` | `#0B6B65` | `#6FE0D5` |
| Link hover | `#08403C` | `#9FE8E0` |
| Selected / `bg-selected` | `#E2F5F3` | `#17322F` |
| Input/select boundary | `#4B5F5D` | `#8FA5A2` |

`text-link` is also the shared underlined-link class. Native form controls inherit the theme's colour scheme, and input placeholders use muted text. Form boundaries use the stronger muted colour rather than the subtle card/table border. Current navigation uses a tint fill, base-teal indicator and heavier text; active state is not conveyed by colour alone. Specification dividers and cards use the subtle border.

Focus uses a base-teal outline and an additional contrasting edge: link teal in light mode and the page colour in dark mode. This keeps the base focus colour visible on the light page. Do not use base teal as small body text on light backgrounds.

### Status colours

| Role | Light background / text | Dark background / text |
| --- | --- | --- |
| Warning | `#FBEFD0` / `#7F5200` | `#332A12` / `#FBEFD0` |
| Error | `#FBE6E4` / `#B8352F` | `#3B201E` / `#FBE6E4` |

These tokens are available for future status callouts. Keep an explicit text description or icon with any status; colour alone is insufficient.

## Contrast checks

Calculated from the exact sRGB values, rounded to two decimal places:

| Foreground / background | Ratio |
| --- | --- |
| Brand ink / base teal | 8.73:1 |
| Base teal / dark page | 9.63:1 |
| Link teal / white | 6.35:1 |
| Link teal / light page | 5.92:1 |
| Link teal / tint | 5.62:1 |
| Muted text / light page | 6.33:1 |
| Dark muted text / dark surface | 6.39:1 |
| Dark muted text / selected fill | 5.26:1 |
| Dark link / dark page | 11.75:1 |
| Hover button text / deep teal | 10.13:1 |
| Light warning text / warning background | 5.90:1 |
| Light error text / error background | 4.89:1 |

These text pairs exceed the 4.5:1 normal-text threshold. Evaluate new pairings rather than assuming a brand colour is readable on every background. Decorative borders/illustration details are not text colours.

## Dark-mode behaviour

The header includes a keyboard-operable **Dark mode** toggle with `aria-pressed` reflecting whether dark mode is active. Its label stays stable so assistive technology can announce the toggle state. The toggle is available at mobile and desktop widths.

- With no saved choice, the site follows `prefers-color-scheme`, including changes while a page is open.
- Choosing a theme stores only `light` or `dark` in `localStorage` under `velogroupsets-theme`. That choice wins over the system setting and survives reloads/navigation. Storage changes synchronize other open tabs.
- Clearing the saved key returns the site to the system preference. If storage is blocked, the toggle still changes the current page without throwing.
- Without JavaScript, native `color-scheme` and CSS `light-dark()` follow the system theme, and the inactive toggle stays hidden. These CSS features target current browsers; Chromium is exercised in CI.
- The small external [theme.js](../apps/web/public/theme.js) script runs synchronously in the head to apply a saved preference before the page paints. Astro's `is:inline` directive preserves the **external script tag**; no inline executable code is added. The existing self-only application-script CSP remains sufficient.
- Reduced-motion preferences disable theme-control transitions. Theme changes do not alter catalogue data, URLs or link behaviour.

Use semantic colours throughout, including illustrations, form controls, cards, links and the skip link. Do not reintroduce cream/grey hard-coded backgrounds, white surfaces that ignore dark mode, or white text on base teal. Keep meaningful labels readable and retain model identifiers as the primary component heading.

## Verification

Run `npm run build`, `npm test`, `npm run worker:check` and `npm run test:browser` from the repository root. Browser coverage includes system-theme changes, keyboard operation, saved preference across reloads/pages, storage-disabled operation, no-JavaScript fallback, button/link colours and dark form controls. Inspect mobile/tablet/desktop pages in both themes before changing token roles.
