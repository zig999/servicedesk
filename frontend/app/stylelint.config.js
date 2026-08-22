// Configuration for the `lint:css` step this project's standard
// (frontend-typescript.yaml) declares. Decides ACC-05, ACC-12, MNT-02, VIS-01
// and VIS-05 through stock stylelint rules and stylelint-a11y, over declared
// values; VIS-02, VIS-03 and VIS-04 need a numeric-range comparison no stock
// rule expresses, so the three local plugins under ./stylelint-rules/ decide
// them instead -- exactly what the standard's own presupposes note for this
// file anticipates ("most of them through custom rules over declared
// values").
import vis02CubicBezierRange from "./stylelint-rules/vis-02-cubic-bezier-range.js";
import vis03MinLineHeight from "./stylelint-rules/vis-03-min-line-height.js";
import vis04MinFontSize from "./stylelint-rules/vis-04-min-font-size.js";

export default {
  plugins: [
    "@double-great/stylelint-a11y",
    vis02CubicBezierRange,
    vis03MinLineHeight,
    vis04MinFontSize,
  ],
  rules: {
    // ACC-05 -- a focus indicator is visible and never suppressed without a replacement style.
    "a11y/no-outline-none": true,
    // ACC-12 -- an animation or transition sits inside a reduced-motion query.
    "a11y/media-prefers-reduced-motion": true,

    // MNT-02 -- a visual value with meaning is referenced through a token, never a literal.
    "color-no-hex": true,
    "unit-disallowed-list": [
      ["px", "ms"],
      { message: "Reference a design token instead of a literal px/ms value (MNT-02)." },
    ],

    // VIS-01 -- a transition names transform/opacity, never `all` or a layout property.
    // VIS-05 -- text is painted with a solid color; background-clip never fills glyphs with a gradient.
    "declaration-property-value-disallowed-list": {
      "transition-property": [
        /^all$/,
        /^(width|height|padding.*|margin.*|top|left|right|bottom|inset.*)$/,
      ],
      "background-clip": [/^text$/],
    },

    // VIS-02, VIS-03, VIS-04 -- decided by the local plugins imported above.
    "tui-substrate/vis-02-cubic-bezier-range": true,
    "tui-substrate/vis-03-min-line-height": true,
    "tui-substrate/vis-04-min-font-size": true,
  },
};
