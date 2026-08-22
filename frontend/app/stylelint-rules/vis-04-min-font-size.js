// A local stylelint rule deciding VIS-04: "A literal font-size is at least
// 12px, or the equivalent in the unit used." No stock stylelint rule
// expresses a numeric lower bound over a declared value.
import stylelint from "stylelint";

const ruleName = "tui-substrate/vis-04-min-font-size";
const MIN_FONT_SIZE_PX = 12;
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value) =>
    `Expected a font-size of at least ${MIN_FONT_SIZE_PX}px (VIS-04), found "${value}".`,
});

/** @type {import('stylelint').Rule} */
const ruleFunction = (enabled) => {
  return (root, result) => {
    if (!enabled) return;

    root.walkDecls("font-size", (decl) => {
      // Only a literal px value is decided here -- a rem/em/% value needs the
      // root or inherited font-size to resolve against, which a rule reading
      // only the declared value cannot do; that remainder stays a reading.
      const match = /^([\d.]+)px$/.exec(decl.value.trim());
      if (!match) return;
      if (Number.parseFloat(match[1]) < MIN_FONT_SIZE_PX) {
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
