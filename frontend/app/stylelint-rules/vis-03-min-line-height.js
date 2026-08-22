// A local stylelint rule deciding VIS-03: "A declared line-height is at least
// 1.3." No stock stylelint rule expresses a numeric lower bound over a
// declared value.
import stylelint from "stylelint";

const ruleName = "tui-substrate/vis-03-min-line-height";
const MIN_LINE_HEIGHT = 1.3;
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value) =>
    `Expected line-height of at least ${MIN_LINE_HEIGHT} (VIS-03), found "${value}".`,
});

/** @type {import('stylelint').Rule} */
const ruleFunction = (enabled) => {
  return (root, result) => {
    if (!enabled) return;

    root.walkDecls("line-height", (decl) => {
      const raw = decl.value.trim();
      // Only a bare, unitless number is decided here -- a percentage or a
      // value in another unit needs a font-size to resolve against, which a
      // rule reading only the declared value cannot do; that remainder stays
      // a reading, the same limitation VIS-04's rule discloses for font-size.
      if (!/^[\d.]+$/.test(raw)) return;
      const numeric = Number.parseFloat(raw);
      if (!Number.isNaN(numeric) && numeric < MIN_LINE_HEIGHT) {
        stylelint.utils.report({
          message: messages.rejected(decl.value),
          node: decl,
          result,
          ruleName,
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default stylelint.createPlugin(ruleName, ruleFunction);
