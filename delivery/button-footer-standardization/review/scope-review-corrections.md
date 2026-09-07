---
title: The six corrections the full-scope review raised
summary: What three passes found over the five hooks, seven route files and twenty-six specs the six corrective tasks of button-footer-standardization delivered, with the failures pass not run because the captured run passed whole.
reviewed:
- src/hooks/use-capability-detail-load-error.spec.ts
- src/hooks/use-capability-detail-view.ts
- src/hooks/use-capability-detail.ts
- src/hooks/use-capability-form.ts
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-connector-configuration-form.ts
- src/routes/capability-create-screen-actions.spec.ts
- src/routes/capability-create-screen-cancel.spec.ts
- src/routes/capability-create-screen-listing-route.spec.ts
- src/routes/capability-create-screen.spec.ts
- src/routes/capability-create-screen.tsx
- src/routes/capability-detail-ready-view.tsx
- src/routes/capability-detail-screen-cancel.spec.ts
- src/routes/capability-detail-screen-listing-control.spec.ts
- src/routes/capability-detail-screen-not-registered-reading.spec.ts
- src/routes/capability-detail-screen-origin-independence.spec.ts
- src/routes/capability-detail-screen-outcome.spec.ts
- src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
- src/routes/capability-detail-screen-reading-distinctness.spec.ts
- src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
- src/routes/capability-detail-screen-return-to-origin.spec.ts
- src/routes/capability-detail-screen-route.spec.ts
- src/routes/capability-detail-screen.spec.ts
- src/routes/capability-detail-screen.tsx
- src/routes/capability-form-fields-action-footer.spec.ts
- src/routes/capability-form-fields-output-schema-guidance.spec.ts
- src/routes/capability-form-fields.tsx
- src/routes/capability-not-read-only-refusal-status.spec.ts
- src/routes/connector-configuration-create-screen-cancel.spec.ts
- src/routes/connector-configuration-create-screen.spec.ts
- src/routes/connector-configuration-create-screen.tsx
- src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
- src/routes/connector-configuration-detail-ready-view.tsx
- src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-detail-screen.tsx
- src/routes/connector-configuration-form-fields-action-footer.spec.ts
tasks:
- task/abandonment-and-listing-route/capability-create-abandon-and-listing-route
- task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- task/abandonment-and-listing-route/connector-create-abandon-and-listing-route
- task/abandonment-and-listing-route/connector-detail-abandon-and-listing-route
- task/misstated-facts-in-source/nature-refusal-fixture-status
- task/misstated-facts-in-source/output-schema-help-copy
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: a captured run that reported a failure — the run this review captured over the six corrections, run/scope-review-corrections, passed every one of its eight steps, so there was no failure for the pass to read
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: Taking the abandonment control lands the operator on the surface the authoring entry was reached from, whichever surface that is, the capabilities listing included.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-cancel.spec.ts
    name: navigates back to the capability detail screen it was opened from, rather than a fixed destination
  - file: src/routes/capability-create-screen-cancel.spec.ts
    name: navigates back to the capabilities listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged destination
- criterion: Taking the abandonment control, where the authoring surface was reached from no surface, lands the operator on the capabilities listing.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-cancel.spec.ts
    name: navigates to the capabilities listing when the create screen was opened at its own address, with no history to return to
- criterion: Taking the abandonment control issues no register-capability call and leaves every registered capability exactly as it stood.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-cancel.spec.ts
    name: issues no PUT when the abandonment is taken after the form was filled in, leaving the registered set untouched
  why: 'The ''leaves every registered capability exactly as it stood'' half is exercised only as the absence of a PUT: putCallCount counts calls whose method is PUT, so a write issued by any other method would not be seen, and no registered capability is re-read and compared.'
- criterion: A control whose destination is the capabilities listing renders while the read of the concepts the surface offers is outstanding.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-listing-route.spec.ts
    name: renders a Capabilities link addressed at the listing while the concept vocabulary is still loading
  - file: src/routes/capability-create-screen.spec.ts
    name: renders the same Capabilities route while the concept vocabulary is still loading
- criterion: A control whose destination is the capabilities listing renders once that read of the concepts has failed.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-listing-route.spec.ts
    name: renders the Capabilities link beside Retry once the concept vocabulary fails to load
  - file: src/routes/capability-create-screen.spec.ts
    name: 'keeps a route to the capabilities listing available while the load has failed (edge case: a dependency that fails)'
- criterion: A control whose destination is the capabilities listing renders once the surface is ready to author.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-listing-route.spec.ts
    name: renders the Capabilities link once the concept vocabulary has loaded and the form is ready
  - file: src/routes/capability-create-screen.spec.ts
    name: renders Capabilities as a link to /capabilities once the form is ready
- criterion: Taking the control whose destination is the capabilities listing issues no register-capability call.
  state: partial
  tests:
  - file: src/routes/capability-create-screen-listing-route.spec.ts
    name: navigates to the capabilities listing when Capabilities is clicked, issuing no PUT even with a valid form filled in
  - file: src/routes/capability-detail-screen-listing-control.spec.ts
    name: issues no PUT when the Capabilities link is clicked from the ready reading
  why: Two of the six tasks state this criterion in the same words, once per surface, and the audit answered each; both answers stand here. The control is taken only from a pristine reading — the capability is loaded and no field has been edited — where Save is disabled and no submittable registration is in hand, so an implementation that submitted pending edits before navigating would still issue no PUT and pass. Nothing in the set edits a field and then takes the listing control.
- criterion: No control returning the surface's fields to the content of a read registration renders on the surface.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-actions.spec.ts
    name: renders no Discard changes control anywhere on the create surface
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: renders no Discard changes control
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders no Discard changes control
  why: Two of the six tasks state this criterion in the same words, once per surface, and the audit answered each; both answers stand here. The absence is asserted of one control — a button named "Discard changes" — so a field-restoring control carried under another label, or as a link rather than a button, would pass.
- criterion: No proof of the capability creation surface asserts that the abandonment lands the operator at the capabilities listing where a reaching surface exists.
  state: unauditable
  why: 'The criterion''s subject is the proof set rather than a behaviour of the surface, and it is not readable well enough to look for as stated. Two things make it so. First, nothing in this set asserts anything about the capability creation surface''s proofs (the one meta-proof here, src/routes/capability-not-read-only-refusal-status.spec.ts, reads proof files for a different fact), so no test would fail if the prohibition stopped holding. Second, read literally the prohibition collides with this task''s own criterion 1: src/routes/capability-create-screen-cancel.spec.ts''s "navigates back to the capabilities listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged destination" asserts a landing at the capabilities listing on a surface reached from a surface that exists, which criterion 1 demands and this criterion appears to forbid. Whether the prohibition reaches the case where the reaching surface is itself the listing is not settled here.'
- criterion: Taking the return-to-origin control, on a surface reached from a surface that exists, lands the operator on that surface, demonstrated over an origin that is not the capabilities listing.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: returns to the surface the detail screen was reached from, rather than the capabilities listing, and issues no register-capability call
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and no field has been edited, lands the operator on the capabilities listing, demonstrated in each of the four readings of the surface.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the outstanding-read reading
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the failed-read reading
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the nothing-registered reading
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the ready reading
  - file: src/routes/capability-detail-screen.spec.ts
    name: navigates back to the capabilities list when Cancel is clicked
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and a field has been edited away from what the read answered, lands the operator on the capabilities listing.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the ready reading even once a field has been edited away from what the read answered
  - file: src/routes/capability-detail-screen-cancel.spec.ts
    name: navigates to the capabilities listing when Cancel is clicked while an edit is pending, issuing no PUT
- criterion: A return-to-origin control renders while the read of the named capability's identity is outstanding.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: renders while the read is outstanding
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the outstanding-read reading
- criterion: A return-to-origin control renders once that read has failed.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: renders once the read has failed
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the failed-read reading
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked once the read has failed for a reason other than the refusal
- criterion: A return-to-origin control renders once the capability has been read and is shown.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: renders once the capability has been read and is shown
  - file: src/routes/capability-detail-screen-origin-independence.spec.ts
    name: renders both controls when reached from one surface that is not the capabilities listing
  - file: src/routes/capability-detail-screen-cancel.spec.ts
    name: renders Cancel as a button distinct from Discard, alongside a separate Capabilities link addressed at the listing
- criterion: A return-to-origin control renders where that read answered that no capability is registered at that name and version.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: renders where the read answered that no capability is registered at that name and version
  - file: src/routes/capability-detail-screen.spec.ts
    name: withholds Retry and keeps Cancel and Capabilities available when the read fails because the identity itself is unregistered -- an implementation rendering this as the failed-read reading would fail this
- criterion: The presence of the return-to-origin control and the presence of the capabilities-listing control turn on nothing about which surface the detail surface was reached from, demonstrated over two origins that differ and over the capabilities listing itself.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-origin-independence.spec.ts
    name: renders both controls when reached from one surface that is not the capabilities listing
  - file: src/routes/capability-detail-screen-origin-independence.spec.ts
    name: renders both controls when reached from a different surface that is not the capabilities listing
  - file: src/routes/capability-detail-screen-origin-independence.spec.ts
    name: renders both controls when reached from the capabilities listing itself
  why: The three origins are demonstrated in the reading where the capability is shown only; the criterion fixes the origins and not the readings, so this satisfies it as stated.
- criterion: Taking the return-to-origin control issues no register-capability call and leaves every registered capability exactly as it stood, in membership and in every registration's own declared contract, in each of the four readings and on both destinations the act may land on.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: returns to the surface the detail screen was reached from, rather than the capabilities listing, and issues no register-capability call
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the outstanding-read reading
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the failed-read reading
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the nothing-registered reading
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: lands on the capabilities listing from the ready reading
  - file: src/routes/capability-detail-screen-cancel.spec.ts
    name: navigates to the capabilities listing when Cancel is clicked while an edit is pending, issuing no PUT
  why: Of the two destinations the act may land on, only the capabilities listing is exercised across the four readings; the reached-from destination is exercised in the reading where the capability is shown alone, so nothing takes the control from the outstanding-read, failed-read or nothing-registered reading on a surface that has an origin to return to. And 'in membership and in every registration's own declared contract' is exercised only as the absence of a PUT call — no registered capability is re-read and compared, and a write by any other method would not be counted.
- criterion: A control whose destination is the capabilities listing renders in each of those same four readings.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-listing-control.spec.ts
    name: renders while the read is outstanding
  - file: src/routes/capability-detail-screen-listing-control.spec.ts
    name: renders once the read has failed
  - file: src/routes/capability-detail-screen-listing-control.spec.ts
    name: renders once the capability has been read and is shown
  - file: src/routes/capability-detail-screen-listing-control.spec.ts
    name: renders where the read answered that no capability is registered at that name and version
  - file: src/routes/capability-detail-screen-route.spec.ts
    name: renders a Capabilities route to the listing while the capability read is still pending -- an implementation withholding the route here would fail this
  - file: src/routes/capability-detail-screen.spec.ts
    name: 'keeps a Capabilities route to the listing available when the load fails (edge case: a dependency that fails)'
- criterion: The outstanding-read reading states that the capability at that name and version is still being read.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
    name: shows only the outstanding-read text, naming this capability's own name and version, while the read is pending
- criterion: Neither the outstanding-read reading nor the failed-read reading presents the nature, the input schema, the output schema, the timeout, the connector or the concept of any capability as the content standing at that name and version.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
    name: presents no capability field while the read is outstanding
  - file: src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
    name: presents no capability field once the read has failed
  why: All six named items are asserted absent in both readings, but each assertion is a label query, so a value presented as unlabelled prose rather than as a labelled field would pass.
- criterion: The reading standing on a read that failed other than by the registry's refusal of an identity no capability is registered at states that the capability at that name and version could not be read.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
    name: shows only the failed-read text once the read fails, neither the outstanding-read text nor the loaded form
- criterion: That same reading carries a control whose one effect is to issue that same read again, and no other reading of the surface carries that control.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
    name: renders no Retry control while the read is still outstanding
  - file: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
    name: renders no Retry control once the capability has been read and is shown
  - file: src/routes/capability-detail-screen.spec.ts
    name: withholds Retry and keeps Cancel and Capabilities available when the read fails because the identity itself is unregistered -- an implementation rendering this as the failed-read reading would fail this
  - file: src/routes/capability-detail-screen-return-to-origin.spec.ts
    name: renders once the read has failed
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reports the load-error phase, with a retryLoad function, when the GET fails
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reissues the GET when retryLoad is called, resolving to ready once the failure clears
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reports the not-registered phase, with no retryLoad exposed, when the identified (name, version) capability does not exist
  why: 'The exclusivity half — the control in no other reading — is exercised across the outstanding, shown and nothing-registered readings. What is unexercised is the control''s effect: nothing in the set clicks the rendered Retry control on this surface and shows the read of that name and version is issued again; the reissue is exercised only by invoking the hook''s own retryLoad function, and ''whose one effect'' — that taking it does nothing besides that read — is asserted nowhere.'
- criterion: The surface issues the read of that name and version again only where the operator takes that control, and on no initiative of its own.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reissues the GET when retryLoad is called, resolving to ready once the failure clears
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reissues the concept vocabulary read when retryLoad is called after only that read failed, resolving to ready once it succeeds
  why: 'The set shows a read follows a call to retryLoad — asserting only that the call count grew, not that it grew by one. The ''only where the operator takes that control, and on no initiative of its own'' half is unexercised: nothing holds the failed reading untouched and shows no further read is issued.'
- criterion: The outstanding-read reading, the reading standing on a read that failed other than by that refusal, and the reading that shows the capability are each distinguishable from the other two to the operator, and none of the three is rendered as either of the others.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
    name: shows only the outstanding-read text, naming this capability's own name and version, while the read is pending
  - file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
    name: shows only the failed-read text once the read fails, neither the outstanding-read text nor the loaded form
  - file: src/routes/capability-detail-screen-reading-distinctness.spec.ts
    name: shows only the loaded form once the capability is read and shown, neither the outstanding-read text nor the failed-read text
- criterion: No control returning the surface's fields to the content of a read registration renders in the outstanding-read reading, in the reading standing on a read that failed other than by that refusal, or in the reading where that read answered that no capability is registered at that name and version.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-not-registered-reading.spec.ts
    name: renders no Discard control in the nothing-registered reading
  why: Only the third of the three readings is exercised. Nothing in this set asserts the absence of a field-restoring control in the outstanding-read reading or in the reading standing on a read that failed other than by that refusal — the two readings src/routes/capability-detail-screen-cancel.spec.ts shows the control present in when the capability is shown.
- criterion: Taking the abandonment control lands the operator on the surface the authoring surface was reached from, whichever surface that is, the connector-configurations listing included.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: navigates back to the connector detail screen it was opened from, rather than a fixed destination
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: navigates back to the connector-configurations listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged fixed destination
- criterion: Taking the abandonment control, where the authoring surface was reached from no surface, lands the operator on the connector-configurations listing.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in -- a Cancel wired to submit before navigating would fail this
- criterion: Taking the abandonment control issues no register-connector call and leaves every registered connector configuration exactly as it stood.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in -- a Cancel wired to submit before navigating would fail this
  why: 'The ''leaves every registered connector configuration exactly as it stood'' half is exercised only as the absence of a PUT: putCallCount counts calls whose method is PUT, and no registered configuration is re-read and compared.'
- criterion: A control whose destination is the connector-configurations listing renders on the surface.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the footer's Connectors link to /connectors
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the footer's Connectors link when the screen is loaded directly at /connectors/new, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders the create screen's own Cancel and Connectors controls beside Save, inside the Actions group
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders exactly one link on the screen, the footer's Connectors link, resolving to /connectors
  why: 'The criterion is covered, and one of the tests asserts more than it establishes: src/routes/connector-configuration-form-fields-action-footer.spec.ts''s "renders exactly one link on the screen, the footer''s Connectors link, resolving to /connectors" claims a totality over the whole surface — exactly one link anywhere — where the criterion names only that a control with that destination renders, so a sibling task that legitimately adds any second link to this screen breaks it.'
- criterion: Taking the control whose destination is the connector-configurations listing issues no register-connector call.
  state: partial
  tests:
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: navigates to /connectors on Connectors without issuing any PUT request -- an implementation that submits register-connector before navigating would fail this
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: issues no PUT request when the footer's Connectors link is clicked -- an implementation that submits register-connector before navigating would fail this
  why: Two of the six tasks state this criterion in the same words, once per surface, and the audit answered each; both answers stand here. The control is taken on a surface whose form is untouched — no connector name, no configuration — where Save is disabled and nothing is submittable, so an implementation that submitted before navigating would still issue no PUT and pass. Nothing in the set fills the authoring form and then takes the listing control, which is where a route that registered before landing would show; the sibling capability proof does exactly that, and this one does not. || The control is taken only from a pristine shown reading, where the configuration is exactly as the read answered it and Save is disabled, so an implementation that submitted pending edits before navigating would still issue no PUT and pass. Nothing in the set edits the configuration and then takes the listing control.
- criterion: No proof of the connector-configuration creation surface asserts that the abandonment lands the operator at the connector-configurations listing where a reaching surface exists.
  state: unauditable
  why: 'The criterion''s subject is the proof set rather than a behaviour, and it is not readable well enough to look for as stated. Nothing in this set asserts anything about this surface''s proof files, so no test would fail if the prohibition stopped holding; the describe block in src/routes/connector-configuration-create-screen-cancel.spec.ts labelled "criterion 7" exercises the abandonment registering nothing, not the prohibition. And read literally the prohibition collides with criterion 1: that same file''s "navigates back to the connector-configurations listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged fixed destination" asserts a landing at the listing on a surface reached from a surface that exists. Whether the prohibition reaches the case where the reaching surface is itself the listing is not settled here.'
- criterion: Taking the return-to-origin control, on a surface reached from a surface that exists, lands the operator on that surface, demonstrated over an origin that is not the connector-configurations listing.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates back to the origin surface it was reached from, rather than the connector-configurations listing, and issues no PUT
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and the configuration has not been edited, lands the operator on the connector-configurations listing, demonstrated in each of the four readings of the surface.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked while the read is still outstanding
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked once the read has failed for a reason other than the refusal
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked once the read was refused because nothing is registered under that connector name
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked with no edits once the configuration is shown
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and the configuration has been edited away from what the read answered, lands the operator on the connector-configurations listing.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
    name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even with unsaved edits -- a Cancel wired to submit before navigating would fail this
- criterion: A return-to-origin control renders while the read of the named connector's configuration is outstanding.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked while the read is still outstanding
- criterion: A return-to-origin control renders once the configuration has been read and is shown.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders both controls when reached from one surface that is not the listing
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked with no edits once the configuration is shown
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
- criterion: A return-to-origin control renders where that read was refused because nothing is registered under that connector name.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders the return-to-origin control and the listing-route control, and renders no field-restoring control
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked once the read was refused because nothing is registered under that connector name
- criterion: The presence of the return-to-origin control and the presence of the listing-route control turn on nothing about which surface the detail surface was reached from, demonstrated over two origins that differ and over the connector-configurations listing itself.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders both controls when reached from one surface that is not the listing
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders both controls when reached from a different surface that is not the listing
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders both controls when reached from the connector-configurations listing itself
  why: The three origins are demonstrated in the reading where the configuration is shown only; the criterion fixes the origins and not the readings, so this satisfies it as stated.
- criterion: Taking the return-to-origin control issues no register-connector call and leaves every registered connector configuration exactly as it stood, in membership and in every registration's own content, in each of the four readings and on both destinations the act may land on.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates back to the origin surface it was reached from, rather than the connector-configurations listing, and issues no PUT
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked while the read is still outstanding
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked once the read has failed for a reason other than the refusal
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked once the read was refused because nothing is registered under that connector name
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: navigates to /connectors and issues no PUT when Cancel is clicked with no edits once the configuration is shown
  - file: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
    name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even with unsaved edits -- a Cancel wired to submit before navigating would fail this
  why: Of the two destinations, only the connector-configurations listing is exercised across the four readings; the reached-from destination is exercised in the reading where the configuration is shown alone, so nothing takes the control from the outstanding, failed or refused reading on a surface that has an origin to return to. And 'in membership and in every registration's own content' is exercised only as the absence of a PUT call — no registered configuration is re-read and compared.
- criterion: A control whose destination is the connector-configurations listing renders in each of those same four readings.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders the footer's Connectors link to /connectors while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders the return-to-origin control and the listing-route control, and renders no field-restoring control
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: navigates back to the connector-configurations list when the footer's Connectors link is clicked
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders the footer's Connectors link when the screen is loaded directly at its own address, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  why: 'All four readings are exercised, and three neighbouring tests assert more than the criterion establishes: src/routes/connector-configuration-detail-screen-listing-route.spec.ts''s "renders exactly one link, the footer''s Connectors link, during the loading phase" and "renders exactly one link, the footer''s Connectors link, during the load-error phase", and src/routes/connector-configuration-detail-screen.spec.ts''s "renders exactly one link, the ready view''s Connectors link, during the ready phase", each claim a totality over the whole surface — exactly one link anywhere — which the criterion does not state and which any legitimately added link breaks. The two loading and load-error ones also assert only the count, never that the one link is the listing route or where it points.'
- criterion: The outstanding-read reading states that the configuration is still being read.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration is still being read and presents no connector or configuration field
- criterion: Neither the outstanding-read reading nor the failed-read reading states a connector or configuration value.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration is still being read and presents no connector or configuration field
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration could not be read and presents no connector or configuration field
  why: 'Both readings are exercised, but each assertion is a label query over the Connector and Configuration form fields, so a connector or configuration value stated as prose rather than in a labelled field would pass — and that is not hypothetical here: the outstanding-read reading''s own text, which the same test waits for, is "Loading connector configuration some-connector…", naming a connector value. Nothing in the set holds the criterion against a value stated that way.'
- criterion: The reading standing on a read that failed other than by the refusal answered because nothing is registered under that connector name states that the configuration could not be read.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration could not be read and presents no connector or configuration field
- criterion: That same reading carries a control that issues the read of the named connector's configuration again.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: issues exactly one more GET to the same connector's configuration per Retry click, never zero and never more than one
- criterion: The surface issues that read again only where the operator takes that control, and on no initiative of its own.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: issues exactly one more GET to the same connector's configuration per Retry click, never zero and never more than one
  why: Exercised by that test's two halves — exactly one read stands before the click, so nothing was reissued on the surface's own initiative in the failed window, and exactly one more follows the click.
- criterion: The reading that shows the configuration states the connector and the configuration as the read answered them, and states no value that answer did not carry.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders the connector's own identity and its configuration, both read from the GET this route's own hook issues
  why: 'The positive half is exercised: the heading, the Connector field and the Configuration field are each held to what the read answered. The ''states no value that answer did not carry'' half is unexercised — nothing asserts the absence of content the answer did not carry, and the shown reading also mounts the connector test panel, which issues its own two reads (src/routes/connector-configuration-detail-screen.spec.ts, "renders the shared Connector/Configuration/Save fields and mounts the real ConnectorTestPanel, which issues its own two independent reads") without any test weighing what it states against this criterion.'
- criterion: The outstanding-read reading, the reading standing on a read that failed other than by that refusal, and the reading that shows the configuration are each distinguishable from the other two to the operator, and none of the three is rendered as either of the others.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration is still being read and presents no connector or configuration field
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: offers no Retry control while the read is outstanding
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration could not be read and presents no connector or configuration field
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders the connector's own identity and its configuration, both read from the GET this route's own hook issues
  why: Distinctness is exercised in one direction only. The outstanding reading is told from the other two — its own statement present, no fields, no Retry. The failed reading is shown to carry its own statement and no fields, but nothing asserts it is free of the outstanding-read statement; and the shown reading is asserted to carry the read's content but nothing asserts it carries neither the outstanding-read nor the failed-read statement. So 'none of the three is rendered as either of the others' goes unexercised for the failed and shown readings, unlike the capability sibling, whose src/routes/capability-detail-screen-reading-distinctness.spec.ts asserts all three directions.
- criterion: No control returning the surface's fields to the content of a read registration renders in the outstanding-read reading, in the reading standing on a read that failed other than by that refusal, or in the reading where that read was refused because nothing is registered under that connector name.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders no Discard changes control while the read is still outstanding -- an implementation offering it in the loading window would fail this
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders no Discard changes control once the read fails -- an implementation offering it in the load-error window would fail this
  - file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
    name: renders the return-to-origin control and the listing-route control, and renders no field-restoring control
  why: All three readings are exercised; each assertion is bound to a button named "Discard changes", so a field-restoring control under another label, or as a link, would pass.
- criterion: The stand-in refusal carrying CapabilityNotReadOnlyError in the capability detail surface's outcome proof responds with HTTP 422.
  state: covered
  tests:
  - file: src/routes/capability-not-read-only-refusal-status.spec.ts
    name: responds with HTTP 422, the status the registry answers that refusal with
  why: 'Covered, and the test asserts more than the criterion establishes: `toEqual([422])` fixes not only the status but that the outcome proof holds exactly one such stand-in, so a second stand-in added to that proof — also carrying 422 — would fail it while the criterion holds.'
- criterion: No stand-in in the frontend suite builds CapabilityNotReadOnlyError with a status other than 422.
  state: partial
  tests:
  - file: src/routes/capability-not-read-only-refusal-status.spec.ts
    name: finds every stand-in pairing CapabilityNotReadOnlyError with an HTTP status carrying 422
  why: The universal is exercised only over stand-ins written in one literal form — `errorResponse("CapabilityNotReadOnlyError", &lt;digits&gt;)`. A stand-in that omits the status argument goes undetected and takes its helper's own default, which in src/routes/capability-create-screen.test-support.ts is 409, exactly the status the criterion excludes; so does one that builds the response directly or passes the status as a name rather than a literal. The walk is also rooted at src alone, so any stand-in the frontend suite holds outside that root is never read.
- criterion: That proof still asserts the refusal reaches the operator as a statement naming the read-only condition, told apart from a refusal whose condition the surface does not recognise.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-outcome.spec.ts
    name: shows the registry's own distinguishable refusal message when the edit is refused
  - file: src/routes/capability-detail-screen-outcome.spec.ts
    name: falls back to a generic message for a refusal this surface does not recognise
- criterion: Text stating what the system reads out of an entered output schema renders wherever the capability output-schema entry stands.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: renders the guidance paragraph beside the create screen's own Output schema editor
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: renders the same guidance paragraph beside the detail screen's own Output schema editor
- criterion: That text states that what is entered is JSON.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that the entered content is JSON
- criterion: That text states that the field names read from the entered schema are the keys of its own top-level `properties` object.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that the read field names are the keys of the schema's own top-level properties object
- criterion: That text states that such a key's own declared `type` and `description`, where the entered schema states them, are read as that field's declared semantics.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that each such key's own type and description, where the schema states them, are read as that field's declared semantics
- criterion: That text states that nothing else in the entered schema is read or validated.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that nothing else in the entered schema is read or validated
- criterion: That text states that a `description` entered there states what its value means and names no decision.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that a description entered there states what its value means and names no decision
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: keeps the guidance in Portuguese, matching the register of the copy it replaced
- criterion: That text carries no worked example, whether composed for the surface or reproduced from anywhere else.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: carries no digit, which every worked example over this schema has so far instantiated as a concrete code
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: carries no brace, which a worked JSON snippet would need to show a concrete shape
  why: 'Both tests bind proxies for an example rather than an example: no digit and no brace. A worked example carried in prose — a named key with a stated type and a sample description, carrying neither a digit nor a brace — passes both while the text carries exactly what the criterion forbids. The ''reproduced from anywhere else'' half is exercised no differently from the composed half.'
- criterion: That text states no further claim about what an entered output schema is read for.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states exactly the five claims and no sixth, as five sentences
  why: 'The test counts period-delimited sentences and requires five, which is a proxy for the claim set in both directions: a sixth claim added as a clause inside an existing sentence keeps the count at five and passes, while re-splitting one permitted claim across two sentences fails though the criterion holds. Nothing reads the claims themselves against the five the specification allows.'
- criterion: That text promises no check beyond the ones `rules/integration/a-capability-declares-its-contract` and `rules/integration/a-capability-declares-well-formed-schemas` state a submitted registration is checked for.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: names no check or refusal vocabulary anywhere in the guidance
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: names no check tied to the capability's own read-only nature (criterion 9, narrowed by the node's own bound over a-capability-is-read-only)
  why: 'Both tests forbid a fixed word list, so a promised check phrased outside it — a requirement stated as a plain condition on what the entry must contain — is unexercised. They also assert more than the criterion establishes: the criterion permits the text to promise the checks the two named nodes state, and a text doing so in any of the forbidden words would fail these tests though the criterion holds.'
- criterion: The surface refuses no entry and checks no entered content on any of the grounds that text states.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: does not disable Save for a syntactically valid output schema with no top-level properties object
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: does not disable Save for an output schema whose declared key carries neither type nor description
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: does not disable Save for an output schema whose key's description reads as a decision rather than a meaning
  why: Three of the grounds the text states are exercised — the top-level properties keys, a key's own type and description, and a description that names a decision. Two things are not. The text's own first claim, that what is entered is JSON, is a ground no test submits content against, and src/routes/capability-create-screen.spec.ts shows the surface disabling Save for content that is not valid JSON. And each of the three assertions reads Save's disabled attribute only, so a refusal raised at submission — Save enabled, then the entry rejected on click with no register-capability call — would pass all three.
findings:
- pass: conformance
  file: src/hooks/use-capability-detail-load-error.spec.ts
  where: the describe block "useCapabilityDetail -- bundling the concept vocabulary into the ready phase (an inference the implementation recorded)", lines 78-122
  evidence: it("reports the load-error phase when the concept vocabulary read fails, even though the capability identity GET itself succeeds", async () => { ... await waitFor(() => expect(result.current.phase).toBe("load-error")); }); ... it("reissues the concept vocabulary read when retryLoad is called after only that read failed, resolving to ready once it succeeds", async () => { ... loadErrorState(result.current).retryLoad(); ... await waitFor(() => expect(result.current.phase).toBe("ready")); });
  cost: the file pins, as a passing test, that this surface's "ready" versus "load-error" state and what a single retry control replays both turn on a second resource — the glossary's concept vocabulary — succeeding alongside the capability read, and that one retry reissues both reads together. None of this file's fourteen nodes, nor a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed (which states the in-flight/failed/read windows only for the capability identity read itself), say that a second, unrelated read gates the same state or that retrying replays it too; a reader checking what blocks an operator from reaching "ready", or what a retry control actually re-issues, finds only the capability-identity rule and nothing about the concept vocabulary it is silently bundled with.
  correction: a node would need to state that this surface's read state is a function of both the capability read and the concept-vocabulary read together, and that its retry control reissues both.
- pass: conformance
  file: src/hooks/use-capability-detail-load-error.spec.ts
  where: the describe block "useCapabilityDetail -- exposing no isEditingIdentity flag (an inference the implementation recorded)", lines 124-134
  evidence: expect("isEditingIdentity" in readyState(result.current)).toBe(false);
  cost: pinning the absence of a property on the hook's own return shape states a fact about this surface's internal composition rather than about what an operator can learn or do, and no node of this file's set constrains that shape either way — so nothing here is weighed against the specification; noted for completeness rather than pressed as a finding.
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: lines 62-68, the useQuery call reading the capability by identity
  evidence: 'const query = useQuery({ queryKey: ["capability", name, version], queryFn: () => apiFetch<Capability>(`/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`), });'
  cost: 'This call sets no retry option, so it inherits the shared QueryClient''s retry: 1 default (src/services/query-client.ts, retry: 1), and TanStack Query silently reissues this identity read once on its own before the failed window — or the not-registered window — is ever shown to the operator. The node states the read is issued again only on the operator''s own act, and that a surface re-issuing the read on its own is that loop the rate limit is written against; every load of this surface now contains exactly that automatic reissue, invisible to the operator and independent of anything they did. The hook''s own test harness (use-capability-detail.test-support.ts) disables retry explicitly to avoid this, which is itself evidence that production is left with it active.'
  correction: 'Pass retry: false (or an equivalent override) on this useQuery call so the identity read fires exactly once until the operator''s own reattempt act asks for it again.'
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: the ready-phase return object (lines 188-207), against the private baseline state set at lines 59-60 and 89/92
  evidence: 'const [inputSchemaBaseline, setInputSchemaBaseline] = useState(""); const [outputSchemaBaseline, setOutputSchemaBaseline] = useState(""); ... setInputSchemaBaseline(query.data.input_schema); ... setOutputSchemaBaseline(query.data.output_schema); ... return { phase: "ready", form, conceptOptions: conceptOptions.concepts, inputSchema: { value: inputSchemaValue, isValid: inputSchemaValid, onChange: handleInputSchemaChange }, outputSchema: { value: outputSchemaValue, isValid: outputSchemaValid, onChange: handleOutputSchemaChange }, isDirty, isSubmitting: mutation.isPending, isSubmitSuccessful: mutation.isSuccess, onSubmit, onCancel };'
  cost: The node requires an act, on a surface that has read a registration, whose whole effect is to return every field to the content that read answered. This hook computes inputSchemaBaseline and outputSchemaBaseline from that same read but never returns them, and returns no discard callback either — only form (recoverable via form.reset()) is exposed. Whatever renders this ready phase has the means to discard an edited nature, timeout, connector or concept, but no means at all to discard an edited input or output schema back to what the registry answered; the two attributes whose recovery the node's own description calls out by name are exactly the ones this hook leaves unrecoverable.
  correction: Return the schema baselines (or a discard act built from them) from the ready phase so a consumer can restore both schema fields, not only the form-managed ones, to the last-read registration.
- pass: conformance
  file: src/hooks/use-capability-form.ts
  where: SAVE_FAILURE_MESSAGE_BY_KIND['incomplete-capability-contract'], lines 46-47
  evidence: '"This capability does not declare its contract completely; every field of its contract is required."'
  cost: An operator who omitted only the timeout is told by this message that every field of the contract is required, but rules/integration/a-capability-declares-its-contract has a registration that states no timeout take the default of sixty seconds rather than being refused as incomplete — the message asserts a stricter rule than the registry enforces, and the next reader who wants the timeout's real default behavior finds it contradicted here instead of confirmed.
  correction: State the condition without the blanket "every field of its contract is required" claim, or except timeout's stated default from it, so the message does not assert a completeness rule stricter than the one the node states.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: the `query.isError` branch, lines 117-125
  evidence: "if (query.isError) {\n  return {\n    phase: \"load-error\",\n    retryLoad: () => {\n      void query.refetch();\n    },\n    onCancel,\n  };\n}\n"
  cost: An operator who names a connector nothing has ever been registered under gets the identical "could not be read" experience as one whose read merely glitched, reattempt control included — the specification's own distinct, reattempt-free "nothing is registered under this connector name" presentation is never reached by any code path, so a later reader auditing how an unregistered connector name reads finds only the generic failure branch and has no reason to suspect a fourth presentation was ever specified, let alone that it forbids exactly the reattempt this branch offers.
  correction: distinguish a ConnectorConfigurationNotFoundError (HTTP 404) response from other query failures and return a distinct state that states nothing is registered under the connector name, presents no connector or configuration value, and carries no reattempt action — reserving `retryLoad` for the remaining, genuine failures the current `load-error` phase is meant to cover.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: the `ready`-phase return and the `configuration` field it constructs, lines 152-166
  evidence: "configuration: {\n  value: configurationValue,\n  isValid: configurationValid,\n\n  onChange: handleConfigurationChange,\n},\n"
  cost: 'The hook itself computes `isDirty` by comparing the live text against `configurationBaseline` (line 130-132), so it knows an edit is in place, but it exposes no way to put that edit down without leaving: `configurationBaseline` is set only by `setConfigurationBaseline` and never returned, and the only way to change `configurationValue` from outside is `handleConfigurationChange`, which re-validates whatever text it is given rather than restoring the last read. No view built against this hook''s own return type can offer the discard the specification calls for, no matter how it is written — the capability the rule requires does not exist anywhere reachable from this surface.'
  correction: return a function (e.g. a `discardEdit` alongside `configuration`) that resets `configurationValue` and the form's own fields to `configurationBaseline`, gated by a further explicit confirming act before it takes effect, and expose it in the `ready` phase.
- pass: conformance
  file: src/hooks/use-connector-configuration-form.ts
  where: SAVE_FAILURE_MESSAGE_BY_KIND (lines 44-47) and the `??` fallback inside saveFailureMessage (line 52)
  evidence: "const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {\n  \"connector-configuration-not-well-formed\":\n    \"This configuration is not syntactically valid JSON.\",\n};\n...\nreturn SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;\n"
  cost: rules/integration/a-connector-configuration-holds-a-well-formed-object names two distinct refusal conditions for register-connector — ConnectorConfigurationNotWellFormedError and IncompleteConnectorConfigurationError. This file distinguishes only the first; any other named condition, the incomplete one included, falls through to the same GENERIC_SAVE_FAILURE_MESSAGE ("Something went wrong while saving this connector configuration. Try again.") that a wholly unrecognised failure produces. An operator refused for a specific, nameable reason therefore reads exactly the same toast as one refused for a reason the surface does not recognise, which is precisely the pair a-submitted-registration-states-its-outcome-to-the-operator requires be told apart.
  correction: give the incomplete-configuration condition its own entry in SAVE_FAILURE_MESSAGE_BY_KIND (and its own UiErrorStateKind upstream), distinguishable from both the not-well-formed message and the generic/unrecognised one.
- pass: conformance
  file: src/routes/capability-create-screen-cancel.spec.ts
  where: the describe block "the abandonment control renders on every reading of the surface (disclosed inference)", lines 126-154
  evidence: "it(\"renders Cancel while the concept vocabulary is still loading\", async () => {\n  ...\n  await screen.findByText(\"Loading…\");\n  expect(screen.getByRole(\"button\", CANCEL_BUTTON)).toBeTruthy();\n});\n\nit(\"renders Cancel once the concept vocabulary has failed to load\", async () => {\n  ...\n  await screen.findByRole(\"button\", { name: \"Retry\" });\n  expect(screen.getByRole(\"button\", CANCEL_BUTTON)).toBeTruthy();\n});"
  cost: 'The test locks in, as a required behavior, that the abandonment control must survive the concept-vocabulary loading and failed-load windows of the capability authoring surface — a distinction the specification draws explicitly for the sibling listing route ("The route''s presence turns on nothing further — not on whether the read backing the surface has completed, failed") and for the origin-return act on a detail surface ("present at every reading... conditioned on nothing else"), but never draws for the abandonment act on an authoring surface. The test''s own label, "disclosed inference", names the gap: a future reviewer holding the create screen to the specification finds no node stating this and has only this test''s word for it, so the rule the business actually wants here lives in a test file rather than in the specification.'
- pass: conformance
  file: src/routes/capability-create-screen-cancel.spec.ts
  where: same describe block, line 126
  evidence: '"CapabilityCreateScreen -- the abandonment control renders on every reading of the surface (disclosed inference)"'
  cost: 'The self-applied label "disclosed inference" reads like a decision-log citation but points nowhere: decision-log.md records no entry for this fact, so the phrase claims a provenance the file does not carry, and a reader who trusts the label stops looking for the rule the specification never states.'
- pass: conformance
  file: src/routes/capability-create-screen-listing-route.spec.ts
  where: the fifth describe block, lines 80-108 ("the route to the capabilities listing is not dropped while a save is pending (UNDERDETERMINED, from the specification)")
  evidence: "it(\"keeps the Capabilities link rendered while a save is pending -- an implementation offering the route on only the three readings the criteria name, and dropping it on every other reading, would fail this\", async () => {\n...\nexpect(screen.getByRole(\"link\", { name: \"Capabilities\" }).getAttribute(\"href\")).toBe(\n  \"/capabilities\",\n);\n"
  cost: The task's own criteria for this node enumerate three readings only — the concept read outstanding, the concept read failed, and the surface ready to author — and a submission in flight is not one of them, in the task or in any of the fourteen nodes' own enumerated readings. This test nonetheless requires the link to survive a pending PUT, binding a future implementation to a guarantee the specification's own criteria never named; a reader who finds this test failing will look to the node's stated readings for why and find only three, not four, and the requirement that the route also survive a pending submission lives only in this test.
  correction: Either the node is read (or amended) to state explicitly that the route's presence also holds through a pending registration submission, disclosed as such, or the assertion is narrowed to the three readings the task's criteria actually name.
- pass: conformance
  file: src/routes/capability-create-screen.spec.ts
  where: the describe blocks for criteria 6 and 7, lines 103–156 ("a loading state while the concept vocabulary is pending" and "a failure state offering a retry when the concept vocabulary fails to load")
  evidence: 'expect(await screen.findByText("Loading…")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    ...

    expect(await screen.findByText("Unable to load concepts.")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();

    '
  cost: The three-window shape this specification states elsewhere for a registration read (still-being-read / could-not-be-read-with-a-retry / answered, told apart and never presented as one another) is asserted here for a different read — the concept vocabulary listing this create screen depends on — with no node stating that this read gets the same treatment, that the operator is told anything at all while it is outstanding or has failed, or that a retry is owed. A later reader who wants to know what the create screen owes the operator when the concept vocabulary fails to load will search the specification for it and find nothing; the fact lives only in this test and the component it exercises.
  correction: State, in the specification, what a surface offering entry against the glossary's concept vocabulary tells the operator while that read is outstanding and where it fails — analogous to a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed and a-presented-connector-configuration-states-an-outstanding-or-failed-read, which state exactly this shape for the capability-by-identity and connector-configuration reads but not for list-concepts.
- pass: conformance
  file: src/routes/capability-detail-screen-not-registered-reading.spec.ts
  where: line 21, `await screen.findByText("Unable to load this capability right now.");`
  evidence: await screen.findByText("Unable to load this capability right now.");
  cost: The decision log records, three times over, that no node states what the capability detail surface presents to the operator on the reading where the identity-keyed read answered that nothing is registered at that name and version (rule a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed explicitly excepts this refusal from its own failed window, calling it "its own answer and not this window," and its neighbouring log entries call the surface's actual statement in this reading "noticed and not decided" — twice for the capability side specifically). This assertion fixes that undecided fact to one literal string, and the source (capability-detail-screen.tsx) reuses the exact same text for the genuinely-failed window, so a reader who wants to know what this reading states finds the answer only in this test and in the component's own duplicated string, never in a node; a future change that gave the not-registered reading its own wording (the way the connector-configuration sibling already got one) would break silently against a test the specification gives it no standing to hold.
  correction: State, in a node constraining domain/integration/capability, what the capability detail surface tells the operator on the reading where read-capability-by-identity answered that nothing is registered at that name and version — closing the silence the log already discloses twice — and have this test assert against that decided statement rather than a literal only the test and the component agree on.
- pass: conformance
  file: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
  where: the describe block's title, line 14
  evidence: describe("CapabilityDetailScreen -- the reattempt control is withheld from every reading but the failed-read one (criterion 15)", () => {
  cost: The node this suite is named for (rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed) enumerates exactly three presentations -- read-and-shown, outstanding, failed -- and its expression withholds the reattempt control from only 'the other two' of those three; the registry's refusal of an unregistered name and version is expressly excepted from being 'this window' at all, so no node says whether the control is withheld there. The two tests in this file exercise only the outstanding and shown presentations, yet the suite's own title generalizes to 'every reading but the failed-read one' -- a total exclusivity that includes the not-registered presentation. A reader who takes this title as the specification's own claim will believe the not-registered reading's control-withholding is settled by the specification, when in fact that reading is carried in capability-detail-screen.tsx's own 'not-registered' branch with no node backing it, and this suite offers no test of it either. The gap between what the title claims and what is tested is the gap between the node's loose statement ('in the failed window alone') and its bounded expression ('the other two' of three named presentations).
  correction: Narrow the describe title to the two presentations the tests actually cover (outstanding and shown), or add a third test exercising the not-registered reading together with a node stating what that reading's control presentation must be.
- pass: conformance
  file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  where: line 72, it("lands on the capabilities listing from the nothing-registered reading", ...)
  evidence: await screen.findByText("Unable to load this capability right now.");
  cost: The specification's own decision log records this reading's presented content as noticed and not decided — no node says what the surface states when the identity read answers that nothing is registered. Pinning this exact sentence in the test makes the wording a fact the test enforces rather than one the specification holds, so a later analysis that decides this fact (as it already did for the sibling connector-configuration surface) can contradict a test nobody wrote it against, and a reader who wants to know what this reading presents will not find it in the specification.
  correction: Decide, by analysis, what the capability-detail surface states in this reading (paralleling rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under for connectors), record it in a node, and bring this assertion into line with the decided text rather than the source's own invention.
- pass: conformance
  file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  where: line 141, it("renders where the read answered that no capability is registered at that name and version", ...)
  evidence: await screen.findByText("Unable to load this capability right now.");
  cost: Same as the finding above — a second occurrence of the same unheld fact, asserted independently in a different test, so the specification's silence is doubled in the source rather than closed.
  correction: Same as the finding above.
- pass: conformance
  file: src/routes/capability-detail-screen.spec.ts
  where: lines 73-88, describe block over an identity nothing is registered at rendering its own reading, distinct from the failed-read reading
  evidence: 'await screen.findByText("Unable to load this capability right now."); expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();'
  cost: 'No node states what a capability-keyed surface presents to the operator where the read answered that the capability''s identity itself is unregistered. The governing rule expressly excepts that refusal from its own failed-read window, and the decision log records that this exact silence was noticed and not decided. The sibling fact on the connector-configuration side was decided with its own distinct wording, never could-not-be-read; no equivalent decision exists for capabilities. This test pins the wording shown, identical to the wording the same component states for every other failed read, and pins that Retry is withheld here, as though both facts were already settled. They are not: they are the delivery''s own composition, reusing the neighbouring failure reading''s wording, encoded into a passing test as if it were specification-derived behaviour.'
  correction: Decide, in the specification, what this surface states to the operator where the read answered that the name and version are unregistered — on the model of the connector-configuration sibling — then align this assertion's wording and control expectations to that decision.
- pass: conformance
  file: src/routes/capability-detail-screen.tsx
  where: the "not-registered" phase branch, lines 49-63
  evidence: <p>Unable to load this capability right now.</p>
  cost: an operator who reaches this identity because nothing was ever registered there (a stale link, a typo'd name or version) is told the identical sentence a genuinely failed read shows at line 33 ("Unable to load this capability right now."), the one visible difference being the absence of the Retry control; the specification's own rule treats the registry's refusal of an unregistered identity as "its own answer and not this window" — a different situation from a read that merely failed to answer — so the source has settled, on its own, that this fourth reading tells the operator the same thing a failed read does, and no node records that as the decided content of this reading. A future reader who wants to know what a capability-keyed surface states when nothing is registered at the named identity will look for that fact in the specification and find only the read-in-flight/read-failed rule, which explicitly disclaims covering this case.
  correction: a node deciding what this surface states when the identity-keyed read answers that no capability is registered there — paralleling the connector-configuration side, which already has such a node for its own registry — would give this reading its own content instead of the failed-read window's reused wording.
- pass: conformance
  file: src/routes/capability-form-fields-action-footer.spec.ts
  where: line 50, within the detail-surface test
  evidence: 'expect(within(footer).getByRole("button", { name: "Discard changes" })).toBeTruthy();'
  cost: The two neighbouring Cancel assertions (lines 37-40 and 51-54) were loosened this same delivery to accept either a button or a link, so that whichever affordance the interface renders satisfies the test; the Discard changes assertion was left requiring exactly the button role. An interface free, per the node, to render the discard control as any affordance would fail this test though it violates nothing the specification states, so the test becomes a second, stricter authority over a form decision the specification places with the interface.
  correction: Loosen the Discard changes query the same way the two Cancel queries were loosened, so no single role is required.
- pass: conformance
  file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  where: '`findGuidanceParagraph` (lines 15-21) and the criterion 2-6 assertions locating and checking the guidance paragraph (lines 41-100)'
  evidence: "/o que é inserido aqui é json/i.test(p.textContent ?? \"\")\n...\nexpect(guidance?.textContent).toMatch(\n  /os nomes de campo lidos a partir dele são as chaves do próprio objeto properties de nível superior deste schema/i,\n);\n"
  cost: The five claims rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it requires are locked to their current Portuguese sentences character-for-character, and the very function used to find the paragraph (`findGuidanceParagraph`) depends on one of those exact sentences too. A legitimate rewording of the guidance copy that still states every one of the five claims and adds no sixth — exactly what the node requires — would fail every one of these assertions and the locator itself, so whoever edits the screen's copy must edit this file in lockstep. The node itself states wording is form the interface owns ("which control carries the statement, its wording... are form and belong to the interface, not here"), so this file has no standing to require one specific rendering of it; the day the copy is reworded for clarity, nobody reading a failing assertion here can tell whether substance regressed or only phrasing changed.
  correction: Replace the full-sentence literal regexes (and the locator's exact-phrase match) with substance-level checks — presence of the concepts (JSON; the `properties` object; `type`/`description` as semantics; nothing else read; description states meaning not decision) independent of the exact words chosen — so a reworded but substantively unchanged paragraph still passes.
- pass: conformance
  file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  where: the criterion 8 assertion (lines 122-134)
  evidence: "const sentences = (guidance?.textContent ?? \"\")\n  .split(\".\")\n  .map((sentence) => sentence.trim())\n  .filter((sentence) => sentence.length > 0);\nexpect(sentences).toHaveLength(5);\n"
  cost: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it requires that the surface state exactly five claims and no sixth — a claim count, not a sentence count. Counting period-delimited fragments instead means a paragraph that states the same five claims and nothing else, but renders them across a different number of sentences (a semicolon joining two, or an added clarifying clause with its own period that introduces no new claim), fails this test even though the domain requirement it stands in for is still met — pinning a textual shape the node leaves to the interface as though it were the claim count itself.
  correction: Assert the five claims individually (as criteria 2-6 do) and drop the sentence-count proxy, or state the intent as a claim-count check rather than a `.` split.
- pass: conformance
  file: src/routes/capability-not-read-only-refusal-status.spec.ts
  where: the `toEqual([422])` assertion at line 31 and the `status === 422` comparison at line 42
  evidence: 'expect(capabilityNotReadOnlyStatuses(outcomeProofContent)).toEqual([422]);

    ...

    expect(statuses.every((status) => status === 422)).toBe(true);

    '
  cost: The HTTP status the registry pairs with CapabilityNotReadOnlyError (a-capability-is-read-only states it as 422) is written here a second time, as a bare literal the guard compares against, rather than being read from the one place the specification states it. If that status ever changed in the node, nothing ties this file's `422` to it — the guard would keep enforcing the old number as its own authority, exactly the shape of a stand-in pairing this error with a status the node no longer names, which is the defect this file exists to catch in every other file but repeats in itself.
  correction: Derive the expected status from a single point that answers to the node — e.g. a shared constant the production error-mapping and this guard both read — rather than writing 422 as an unexplained literal a second time in this file.
- pass: conformance
  file: src/routes/connector-configuration-detail-ready-view.tsx
  where: the INVALID_CONFIGURATION_WARNING constant (lines 18-19) and the alert gated on `!state.configuration.isValid` (lines 35-39)
  evidence: '"This connector configuration''s stored value must be a JSON object. Correct it before Save can succeed."'
  cost: This file is the only place in the tree that decides a registered connector configuration's stored value can be not-a-JSON-object and gates Save on the operator correcting it. Every check the specification holds a connector configuration to is a registration-time gate — register-connector refuses a not-well-formed or incomplete configuration at the write (rules/integration/a-connector-configuration-holds-a-well-formed-object), and domain/integration/connector-configuration states its configuration "is held and answered as JSON object text, whatever form a registration supplied it in" — so no node anywhere states that a read of an already-registered configuration can answer something that isn't a JSON object, or what a surface should tell the operator when it does. A reader who meets this warning and looks in the specification for when a stored configuration is invalid, and what corrects it, will not find the rule there; it exists only in this component's own text.
- pass: conformance
  file: src/routes/connector-configuration-detail-screen.tsx
  where: the `loading` branch, line 15
  evidence: <p>Loading connector configuration {connector}…</p>
  cost: while the read of this connector's configuration is still outstanding, the screen already shows the connector's own name inline in the loading text — a value indistinguishable, to the operator, from a connector value the read has confirmed, which is exactly the confusion the rule exists to keep apart from an unanswered read.
  correction: state the outstanding read without interpolating the connector name into the message (e.g. "Loading connector configuration…"), leaving the connector name to appear only once the read answers, in the ready presentation.
- pass: conformance
  file: src/routes/connector-configuration-detail-screen.tsx
  where: the `load-error` branch, lines 28-45
  evidence: <p>Unable to load this connector configuration right now.</p> <Button type="button" onClick={state.retryLoad}>Retry</Button>
  cost: an operator who reached this screen by a connector name nothing is registered under is told the configuration "could not be read right now" and is handed a Retry that can never succeed, rather than being told explicitly that nothing is registered under that name with no dead-end reattempt offered — a definite, permanent refusal is presented exactly like a transient one worth trying again, so the operator cannot tell the two apart or learn that retrying is pointless.
  correction: carry the "nothing is registered under this connector name" refusal in a reading of its own, apart from the generic load-error window — stating that explicitly, presenting no connector or configuration value, saying nothing implying the configuration could not be read, and carrying no reattempt control for this specific refusal.
- pass: conformance
  file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  where: 'lines 38 and 63 — `within(footer).getByRole("link", { name: "Connectors" })`, in both the create-surface composition test and the footer-link-uniqueness test'
  evidence: 'expect(within(footer).getByRole("link", { name: "Connectors" })).toBeTruthy();

    ...

    expect(within(footer).getByRole("link", { name: "Connectors" })).toBe(links[0]);

    '
  cost: The test fails the instant the Connectors control is rendered as anything other than an anchor element carrying ARIA role `link` — a button that programmatically navigates to the listing, for instance. The rule governing this exact control states that which control carries the route is the interface's own choice, not the specification's; the test freezes that choice into a passing/failing condition, so a future, fully conformant change to the control's implementation reads here as a regression, and whoever meets that failure will look in the specification for a link-role requirement and find none.
  correction: Locate the control by its accessible name/text alone (e.g. `getByText("Connectors")`, as this same file already does for the detail surface's Cancel control at line 49) rather than pinning it to `getByRole("link", ...)`.
- pass: conformance
  file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  where: lines 60 and 62 — `const links = screen.getAllByRole("link"); ... expect(links).toHaveLength(1);`
  evidence: 'const links = screen.getAllByRole("link");


    expect(links).toHaveLength(1);

    '
  cost: This states, as a fact about the whole screen and not just the footer, that no link-role element exists anywhere on it besides the Connectors control. No node in the set bounds or even mentions a total count of links a connector-configuration surface may carry — the route rule states only that a route is offered, never that it is the surface's sole link-type element. A later, unrelated addition of any other link anywhere on the page (a help link, a breadcrumb) would fail this test though nothing in the specification forbids it, and the failure would send a reader looking in the specification for a one-link rule that isn't there.
  correction: Drop the screen-wide `getAllByRole("link")`/`toHaveLength(1)` assertion, or scope whatever remains to asserting only that the footer's Connectors control resolves to the listing — the specification makes no claim about the rest of the screen's link inventory.
- pass: standard
  file: src/hooks/use-capability-detail.ts
  where: the useEffect at lines 76-94, keyed on [query.data]
  cites: STA-01
  evidence: "if (query.data) {\n  form.reset({...});\n  setInputSchemaValue(query.data.input_schema);\n  setInputSchemaValid(getJsonTextareaMinifiedValue(query.data.input_schema) !== null);\n  setInputSchemaBaseline(query.data.input_schema);\n  setOutputSchemaValue(query.data.output_schema);\n  setOutputSchemaValid(getJsonTextareaMinifiedValue(query.data.output_schema) !== null);\n  setOutputSchemaBaseline(query.data.output_schema);\n}"
  cost: query.data is react-query's own cache; its input/output schema text is duplicated into four useState slots kept aligned only by this effect. mutation.onSuccess (`setInputSchemaBaseline(inputSchemaValue); setOutputSchemaBaseline(outputSchemaValue);`) has to manually re-sync the copy after every save, so a refetch or an invalidation this hook doesn't explicitly re-sync leaves the editable fields showing schema text the cache has already moved past.
  correction: read inputSchema/outputSchema directly from query.data (memoized/derived where a snapshot is needed) instead of mirroring it into setInputSchemaValue/setOutputSchemaValue/baselines via an effect.
- pass: standard
  file: src/hooks/use-connector-configuration-detail.ts
  where: the useEffect at lines 77-85, keyed on [query.data]
  cites: STA-01
  evidence: "if (query.data) {\n  form.reset({ connector: query.data.connector });\n  setConfigurationValue(query.data.configuration);\n  setConfigurationValid(isValidConfigurationObject(query.data.configuration));\n  setConfigurationBaseline(query.data.configuration);\n}"
  cost: query.data.configuration (the fetched cache entry) is copied into configurationValue/configurationBaseline state; mutation.onSuccess then hand-syncs `setConfigurationBaseline(configurationValue)` to keep the copy aligned with the cache the mutation just invalidated, so any path that refetches without going through this exact effect leaves the copy stale next to the cache it was meant to mirror.
  correction: derive configuration's displayed/baseline value from query.data directly rather than holding a second, effect-synced copy of it in state.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: lines 76-79, `conceptSelectOptions`
  cites: API-01
  evidence: "const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({\n  value: concept.name,\n  label: concept.name,\n}));"
  cost: conceptOptions (the hook's own service-backed data, shaped as ConceptOption) is reshaped into Select's SelectOption prop inline at this one call site rather than through a named, reusable function; a second component that also needs to bind ConceptOption[] to a Select has nothing to call and will write its own value/label mapping, which can drift from this one the first time either changes.
  correction: extract the ConceptOption[] -> SelectOption[] mapping into a named adapter function in a shared module and call it here.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: lines 81-82, `isSaveDisabled`
  cites: ARC-03
  evidence: "const isSaveDisabled =\n  isSubmitting || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;"
  cost: the save-disabled decision -- bundling submitting state, both schema-validity flags and dirtiness -- is computed directly in this component rather than exposed by the hook that owns those four values, so the only way any test can exercise it is by rendering the whole form and reading the button's disabled attribute, exactly the shape the create-screen and form-fields specs are forced into (e.g. "disables Save immediately on mount, since a blank schema is not valid JSON either").
  correction: move this decision into the hook (use-capability-detail.ts / use-capability-form.ts) that already tracks isSubmitting/isDirty/schema validity, exposing an isSaveDisabled field on its returned state for this component to read.
reconciliation: siegard-reconcile/scope-review-corrections.md
---

## What it is
Three passes over one increment of six corrective tasks, thirty-eight files and the fourteen specification nodes those tasks implement.
The conformance pass ran as thirty-eight separate judgments, one per file, each handed only its own file and its own node pack; what they returned is folded into the reconciliation record this one points at, and the bind restamped the ten bindings their judgment cleared and none of the seventeen it did not.
The standard pass read the twenty-four rules of the project's registry that a reading decides and whose scope reaches these paths, as `deliver.py --standard --reading --for` filtered them.

## Notes
The failures pass did not run, and the entry above says which input was missing: the captured run passed all eight steps, so there was no failure to diagnose.
That is not a statement that the change is correct — it is a statement that the project's own tools, over the rules the registry leaves to them, exited zero.
Four of the sixty-six criteria the six tasks state are stated twice, in the same words, by a create task and a detail task over the same registry; the audit answered each once per surface and this record holds one entry per criterion, carrying both answers and the weaker of the two states.
Eleven of the thirty-eight conformance returns were refused by the fold as unparseable, and the cause was transcription rather than judgment: the returns were re-emitted from the same delegations' answers through a YAML serializer instead of typed by hand, and one `read` row that named a node outside its own delegation's pack — an addition made in transcription, not by the judge — was dropped.
Two criteria of the two create tasks are recorded `unauditable`, and the fault is in the criteria: as written, one demands that a test demonstrate the registry's listing as a valid origin the abandonment returns to, while another forbids a proof asserting that the abandonment lands on that listing where a reaching surface exists.
