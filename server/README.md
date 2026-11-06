# Family OS — Server skeleton (Q-170)

Build-proving skeleton only: a Kotlin (Ktor) server with one endpoint.
No features, no systems, no database — the stack builds, nothing more.
Real systems land here only after governance completes (G-003).

## Build & test

Requires JDK 17+ and Gradle 8.11+ (no wrapper yet — added in the
implementation phase):

```sh
cd server
gradle build
```

## Run

```sh
gradle run
# GET http://localhost:8080/health -> {"status":"ok"}
```
