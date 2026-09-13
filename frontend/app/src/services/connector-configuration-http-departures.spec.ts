import { describe, expect, it } from "vitest";
import {
  computeHttpConnectorDepartures,
  HTTP_CONNECTOR_METHODS,
  HTTP_CONNECTOR_STATUS_MAP_ENDINGS,
} from "./connector-configuration-http-departures";

function baseConfig(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    method: "GET",
    statusMap: { "200": "ok" },
    responseMap: { id: "value" },
    address: "https://api.example.com",
    ...overrides,
  };
}

function withoutKey(config: Record<string, unknown>, key: string): Record<string, unknown> {
  const clone = { ...config };
  delete clone[key];
  return clone;
}

function departuresFor(
  config: Record<string, unknown>,
): ReturnType<typeof computeHttpConnectorDepartures> {
  return computeHttpConnectorDepartures(JSON.stringify(config));
}

describe("computeHttpConnectorDepartures -- a method outside the vocabulary is stated as a departure naming the declared value and the admitted methods (criterion 1)", () => {
  it("states one method-outside-vocabulary departure when method is present but not one of the five admitted values", () => {
    const departures = departuresFor(baseConfig({ method: "get" }));

    expect(departures).toEqual([
      {
        kind: "method-outside-vocabulary",
        key: "method",
        value: "get",
        admittedMethods: HTTP_CONNECTOR_METHODS,
      },
    ]);
  });
});

describe("computeHttpConnectorDepartures -- an absent method key states no method departure (the task's own resolved reading of criterion 1)", () => {
  it("returns no departures for an otherwise well-formed configuration declaring no method key at all", () => {
    const departures = departuresFor(withoutKey(baseConfig(), "method"));

    expect(departures).toEqual([]);
  });
});

describe("computeHttpConnectorDepartures -- a statusMap ending outside the vocabulary is stated as a departure naming that entry's own key and the admitted endings (criterion 2)", () => {
  it("states one status-map-ending-outside-vocabulary departure for a single offending entry", () => {
    const departures = departuresFor(baseConfig({ statusMap: { "200": "weird" } }));

    expect(departures).toEqual([
      {
        kind: "status-map-ending-outside-vocabulary",
        key: "statusMap",
        statusMapKey: "200",
        value: "weird",
        admittedEndings: HTTP_CONNECTOR_STATUS_MAP_ENDINGS,
      },
    ]);
  });
});

describe("computeHttpConnectorDepartures -- distinct offending statusMap entries each get their own departure, not one for the whole map (criterion 2, boundary)", () => {
  it("states one departure per offending entry when two different statusMap entries end outside the vocabulary", () => {
    const departures = departuresFor(
      baseConfig({ statusMap: { "200": "weird1", "404": "weird2" } }),
    );

    expect(departures).toEqual([
      {
        kind: "status-map-ending-outside-vocabulary",
        key: "statusMap",
        statusMapKey: "200",
        value: "weird1",
        admittedEndings: HTTP_CONNECTOR_STATUS_MAP_ENDINGS,
      },
      {
        kind: "status-map-ending-outside-vocabulary",
        key: "statusMap",
        statusMapKey: "404",
        value: "weird2",
        admittedEndings: HTTP_CONNECTOR_STATUS_MAP_ENDINGS,
      },
    ]);
  });
});

describe("computeHttpConnectorDepartures -- a statusMap key that is not a valid HTTP-status-shaped string draws no departure of its own, only its ending value is judged (the task's own resolved reading)", () => {
  it("returns no departures for a statusMap entry keyed 'notAStatus' whose value is an admitted ending", () => {
    const departures = departuresFor(baseConfig({ statusMap: { notAStatus: "ok" } }));

    expect(departures).toEqual([]);
  });
});

describe("computeHttpConnectorDepartures -- a statusMap that is absent is stated as a single departure naming statusMap (criterion 3)", () => {
  it("states a status-map-not-an-object departure, not any per-entry ending departure, when statusMap is absent", () => {
    const departures = departuresFor(withoutKey(baseConfig(), "statusMap"));

    expect(departures).toEqual([{ kind: "status-map-not-an-object", key: "statusMap" }]);
  });
});

describe("computeHttpConnectorDepartures -- a responseMap that is absent is stated as a departure naming responseMap (criterion 4)", () => {
  it("states a response-map-departure when responseMap is absent", () => {
    const departures = departuresFor(withoutKey(baseConfig(), "responseMap"));

    expect(departures).toEqual([{ kind: "response-map-departure", key: "responseMap" }]);
  });
});

describe("computeHttpConnectorDepartures -- a responseMap holding a value that is not text is stated as a departure naming responseMap (criterion 4)", () => {
  it("states a response-map-departure when responseMap is an object holding a non-string value", () => {
    const departures = departuresFor(baseConfig({ responseMap: { id: 123 } }));

    expect(departures).toEqual([{ kind: "response-map-departure", key: "responseMap" }]);
  });
});

describe("computeHttpConnectorDepartures -- an address that is absent is stated as a departure naming address (criterion 5)", () => {
  it("states an address-absent-or-empty departure when the address key is absent", () => {
    const departures = departuresFor(withoutKey(baseConfig(), "address"));

    expect(departures).toEqual([{ kind: "address-absent-or-empty", key: "address" }]);
  });
});

describe("computeHttpConnectorDepartures -- a declared query that is not an object of texts is stated as a departure naming query (criterion 6)", () => {
  it("states a query-or-headers-not-object-of-texts departure naming query when query is declared as an array", () => {
    const departures = departuresFor(baseConfig({ query: ["not", "an", "object"] }));

    expect(departures).toEqual([{ kind: "query-or-headers-not-object-of-texts", key: "query" }]);
  });
});

describe("computeHttpConnectorDepartures -- declared headers that are not an object of texts is stated as a departure naming headers (criterion 6)", () => {
  it("states a query-or-headers-not-object-of-texts departure naming headers when a headers entry holds a non-string value", () => {
    const departures = departuresFor(baseConfig({ headers: { "X-Limit": 5 } }));

    expect(departures).toEqual([{ kind: "query-or-headers-not-object-of-texts", key: "headers" }]);
  });
});

describe("computeHttpConnectorDepartures -- query and headers are each optional; neither's absence is stated as a departure (criterion 6, boundary)", () => {
  it("returns no departures for query or headers when neither key is declared", () => {
    const departures = departuresFor(baseConfig());

    expect(departures).toEqual([]);
  });
});

describe("computeHttpConnectorDepartures -- a placeholder written in none of the three admitted forms is stated as a departure, and none of the three admitted forms is ever flagged (criterion 7; node a-connector-configuration-placeholder-is-written-in-one-of-three-forms)", () => {
  it("states one placeholder-outside-forms departure for a malformed placeholder nested deep in the body, alongside well-formed subject, requester and credential placeholders held elsewhere", () => {
    const departures = departuresFor(
      baseConfig({
        address: "https://api.example.com/${subject:accountId}",
        headers: { Authorization: "Bearer ${credential:api-key}" },
        body: { nested: { list: ["${requester}", "${not-a-form}"] } },
      }),
    );

    expect(departures).toEqual([
      { kind: "placeholder-outside-forms", key: "placeholder", placeholder: "${not-a-form}" },
    ]);
  });
});

describe("computeHttpConnectorDepartures -- no departure is stated anywhere the surface's own judgment finds none, over a fully valid configuration (criterion 8)", () => {
  it("returns an empty array when method, statusMap, responseMap, address, query, headers and every placeholder are all well-formed", () => {
    const departures = departuresFor({
      method: "POST",
      statusMap: { "200": "ok", "404": "denied", "500": "unavailable" },
      responseMap: { id: "$.data.id" },
      address: "https://api.example.com/resource",
      query: { verbose: "true" },
      headers: { Authorization: "Bearer ${credential:api-key}" },
      body: { subject: "${subject:accountId}", note: "${requester}" },
    });

    expect(departures).toEqual([]);
  });
});

describe("computeHttpConnectorDepartures -- text outside the well-formed-JSON-object domain the criteria presuppose draws no departure and throws nothing (criterion 8, defensive boundary)", () => {
  it.each([
    ["an empty string", ""],
    ["invalid JSON", "{not valid json"],
    ["a JSON array", "[1,2,3]"],
  ])("returns no departures, without throwing, for %s", (_label, text) => {
    expect(computeHttpConnectorDepartures(text)).toEqual([]);
  });
});
