# Corrective increment — GET vs POST mismatch on read-openapi-document-operations

## Wrong behavior observed

Running the delivered system: the frontend's `useOpenApiDocumentOperations` hook (`frontend/app/src/hooks/use-openapi-document-operations.ts`) calls
`GET /v1/read-openapi-document-operations?link=<encoded-link>` — a query parameter, the default GET method, no body.

The backend route (`src/http/read-openapi-document-operations.routes.ts`) registers `app.post('/v1/read-openapi-document-operations', ...)` — it accepts only POST with a body.

Every real call from the deployed frontend to the deployed backend answers HTTP 404:

```
{"error": "Not Found", "message": "Route GET:/v1/read-openapi-document-operations?link=... not found", "statusCode": 404}
```

## Reproduction

1. Run the backend and the frontend together.
2. Open the Configuration Helper for any connector and enter an OpenAPI document link.
3. The operations read request answers 404 instead of listing operations.

## Decided fix

The backend route accepts GET, with the link carried as a query parameter — matching what the frontend already sends. The frontend is not changed.
