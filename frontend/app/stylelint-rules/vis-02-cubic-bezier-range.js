// A local stylelint rule deciding VIS-02: "A cubic-bezier easing keeps both
// control-point y values inside the range 0 to 1." No stock stylelint rule
// expresses a numeric-range check over a function's arguments, so this rule
// exists to decide it -- exactly what the standard's own presupposes note for
// stylelint.config.js anticipates ("most of them through custom rules over
// declared values").
import stylelint from "stylelint";

const ruleName = "tui-substrate/vis-02-cubic-bezier-range";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value) =>
    `Expected both cubic-bezier control-point y values to sit within 0 to 1 (VIS-02), found "${value}".`,
});

const CUBIC_BEZIER =
  /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/g;

/** @type {import('stylelint').Rule} */
const ruleFunction = (enabled) => {
  return (root, result) => {
    if (!enabled) return;

    root.walkDecls(/^(transition|animation)(-timing-function)?$/, (decl) => {
      for (const match of decl.value.matchAll(CUBIC_BEZIER)) {
        const y1 = Number.parseFloat(match[2]);
        const y2 = Number.parseFloat(match[4]);
        const outOfRange = [y1, y2].some((y) => Number.isNaN(y) || y < 0 || y > 1);
        if (outOfRange) {
          stylelint.utils.report({
            message: messages.rejected(match[0]),
            node: decl,
            result,
            ruleName,
          });
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default stylelint.createPlugin(ruleName, ruleFunction);
