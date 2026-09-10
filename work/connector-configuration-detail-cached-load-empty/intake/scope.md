# Corrective increment — the connector configuration screen presents an empty configuration when the read was already answered at mount

## The wrong behavior, as the human stated it

Observed by running the delivered system, at
`http://localhost:5173/connectors/ifs-fsm-tech-profile-connector`, in the human's own words:

> avalie a aba no chrome http://localhost:5173/connectors/ifs-fsm-tech-profile-connector, existe
> alguma situação em que os dados não são carregados. isto é um erro

The human chose the corrective increment route after the session confirmed the behavior in the
browser.

## How it reproduces

1. Load `/connectors/ifs-fsm-tech-profile-connector` fresh (F5). The Configuration field presents
   the registered configuration, pretty-printed; Beautify is enabled; Save and Discard changes are
   disabled because nothing has been edited.
2. Activate the Connectors link to reach `/connectors`.
3. Activate the same connector in the listing.

At step 3 the Configuration field is empty and carries the alert
`Invalid JSON: Unexpected end of JSON input`; Beautify is disabled; Save and Discard changes are
disabled; the screen-level warning that the stored value must be a JSON object is not shown; and
the Test panel receives an empty registered configuration text, so it derives no subject
attributes from the registered configuration's placeholders.

In both cases the backend read `GET /v1/connectors/ifs-fsm-tech-profile-connector` answered
HTTP 200 with the full configuration:

```
{"connector":"ifs-fsm-tech-profile-connector","configuration":"{\"method\":\"GET\",\"address\":\"http://127.0.0.1:8787/v1/technicians/${subject:user-id}/profile\",\"statusMap\":{\"200\":\"ok\",\"400\":\"denied\",\"403\":\"denied\",\"500\":\"unavailable\",\"503\":\"unavailable\"},\"responseMap\":{\"login\":\"data.id\",\"installations\":\"data.installations\"}}"}
```

The browser console held no message in either case.

## The file the behavior lives in

`src/hooks/use-connector-configuration-detail.ts`, at the frontend target source root.

## What the code shows

`src/hooks/use-connector-configuration-detail.ts:78-87` synchronises the screen's local state
with the read's answer through a marker seeded from the query's current data:

```ts
const [syncedConfigurationData, setSyncedConfigurationData] = useState(query.data);
if (query.data !== syncedConfigurationData) {
  setSyncedConfigurationData(query.data);
  if (query.data) {
    form.reset({ connector: query.data.connector });
    setConfigurationValue(query.data.configuration);
    setConfigurationValid(isValidConfigurationObject(query.data.configuration));
    setConfigurationBaseline(query.data.configuration);
  }
}
```

On a fresh load the query holds no data at first render, the marker is seeded `undefined`, the
answer arrives on a later render, the comparison sees the change and the four local states are
populated. When the answer is already held by the query client's cache at mount — the listing was
visited and the same connector reopened within the cache's lifetime, or the screen is reached by
the browser's history — the query returns the cached answer on the first render, the marker is
seeded with that same object, the comparison never differs, and the four states keep their
initial values: an empty configuration value (`useState("")`, line 63), validity `true`
(line 64) and an empty baseline (line 66).

Because validity stays `true`, `src/routes/connector-configuration-detail-ready-view.tsx:33`
shows no malformed-configuration warning, while `src/shared/components/json-textarea-field.tsx`
parses the empty value and shows its own `Invalid JSON` alert. Because the baseline is also
empty, `isDirty` (line 127) is false, so Save and Discard changes are disabled.
`src/hooks/use-connector-configuration-detail-view.ts:38-44` copies that empty, valid, non-dirty
state into `registeredConfigurationText`, which
`src/routes/connector-configuration-detail-ready-view.tsx:39` hands to the Test panel.

## Scope

This increment corrects the connector configuration screen's presentation of a read that was
already answered at mount, and nothing else. It changes no route, no registry call and no
control's placement or wording.

## What the proof owes

A proof that fails when the defect returns must mount the screen with the connector
configuration read already answered in the query client before the first render — the shape the
running application takes when the listing was visited first — and must also keep the case where
the answer arrives after mount, which works today and must go on working.
