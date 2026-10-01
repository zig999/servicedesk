---
entries:
- field: statement
  unstated: No node stated whether the configuration text a connector configuration draft carries declares a method key at all, or what value it would hold.
  decided: The draft's configuration declares a method, beside the address, query, headers and body derived from the same operation, whose value is the chosen operation's own HTTP method as the OpenAPI document names it, upper-cased. The method a connector configuration currently registered under the same connector name declares is never drafted in its place, whether the two agree or differ.
  why: The document states this key on its own account, unlike responseMap and statusMap -- each operation sits under the very verb its call would issue -- so drafting it invents nothing, and two rules already on record presume it -- the method-comparison rule compares the operation's method against a registration and names both without replacing either, which requires the draft to carry the operation's method for the operator to submit, and the registers-nothing rule leaves that submission the operator's own later act. Upper-cased because drafting the document's lower-case spelling verbatim would generate a configuration that ends unavailable with a MalformedHttpConnectorConfigurationError as soon as it were registered and observed.
---
