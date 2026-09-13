import type { JSX } from "react";
import type { HttpConnectorDeparture } from "../services/connector-configuration-http-departures";
import {
  HTTP_CONNECTOR_ADDRESS_DEPARTURE_MESSAGE,
  HTTP_CONNECTOR_DEPARTURES_HEADING,
  HTTP_CONNECTOR_RESPONSE_MAP_DEPARTURE_MESSAGE,
  HTTP_CONNECTOR_STATUS_MAP_NOT_AN_OBJECT_MESSAGE,
  httpConnectorMethodDepartureText,
  httpConnectorPlaceholderDepartureText,
  httpConnectorQueryOrHeadersDepartureText,
  httpConnectorStatusMapEndingDepartureText,
} from "../services/connector-configuration-messages";

function httpConnectorDepartureKey(departure: HttpConnectorDeparture): string {
  switch (departure.kind) {
    case "method-outside-vocabulary":
      return "method";
    case "status-map-ending-outside-vocabulary":
      return `statusMap:${departure.statusMapKey}`;
    case "status-map-not-an-object":
      return "statusMap";
    case "response-map-departure":
      return "responseMap";
    case "address-absent-or-empty":
      return "address";
    case "query-or-headers-not-object-of-texts":
      return departure.key;
    case "placeholder-outside-forms":
      return `placeholder:${departure.placeholder}`;
  }
}

function httpConnectorDepartureText(departure: HttpConnectorDeparture): string {
  switch (departure.kind) {
    case "method-outside-vocabulary":
      return httpConnectorMethodDepartureText(departure.value, departure.admittedMethods);
    case "status-map-ending-outside-vocabulary":
      return httpConnectorStatusMapEndingDepartureText(
        departure.statusMapKey,
        departure.value,
        departure.admittedEndings,
      );
    case "status-map-not-an-object":
      return HTTP_CONNECTOR_STATUS_MAP_NOT_AN_OBJECT_MESSAGE;
    case "response-map-departure":
      return HTTP_CONNECTOR_RESPONSE_MAP_DEPARTURE_MESSAGE;
    case "address-absent-or-empty":
      return HTTP_CONNECTOR_ADDRESS_DEPARTURE_MESSAGE;
    case "query-or-headers-not-object-of-texts":
      return httpConnectorQueryOrHeadersDepartureText(departure.key);
    case "placeholder-outside-forms":
      return httpConnectorPlaceholderDepartureText(departure.placeholder);
  }
}

export function HttpConnectorDeparturesStatement({
  departures,
}: {
  departures: readonly HttpConnectorDeparture[];
}): JSX.Element | null {
  if (departures.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-foreground">{HTTP_CONNECTOR_DEPARTURES_HEADING}</p>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {departures.map((departure) => (
          <li key={httpConnectorDepartureKey(departure)}>{httpConnectorDepartureText(departure)}</li>
        ))}
      </ul>
    </div>
  );
}
