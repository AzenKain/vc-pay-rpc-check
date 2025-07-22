
# 🚀 rpc-check

A simple Bun-powered server to check the availability of Cosmos-style RPC endpoints via JSON-RPC `status` requests.

## 📦 Install dependencies

```bash
bun install
```

## ▶️ Run the server

```bash
bun run start
```

This will start an Express server (default port: `3344`) with a `/rpc-check` POST endpoint.

## 📮 API Usage

**Endpoint:** `POST /rpc-check`
**Content-Type:** `application/json`

### Request body:

```json
{
  "chains": ["namada"]
}
```

### Response:

```json
{
    "namada": [
        {
            "chain": "namada",
            "url": "https://rpc.namada.validatus.com",
            "latency": 710,
            "status": "OK"
        },
        {
            "chain": "namada",
            "url": "https://namada.itudou.xyz",
            "latency": 718,
            "status": "OK"
        },
        {
            "chain": "namada",
            "url": "https://rpc.namada.stakepool.dev.br",
            "latency": null,
            "status": "FAIL",
            "message": "timeout of 5000ms exceeded"
        }
    ]
}
```

## 🛠 Built with

* [Bun](https://bun.sh) v1.2.11 — Fast all-in-one JS runtime
* Express — For routing and JSON handling
* Axios — For sending JSON-RPC requests
* CORS — Enabled for all origins
