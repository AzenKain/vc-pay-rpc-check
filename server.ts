import express from "express";
import { generateRpcCache, type RpcCache } from "./rpcChecker";
import fs from "fs";
import path from "path";
import corsLib from "cors";

const app = express();
const PORT = 3344;

app.use(express.json());
app.use(corsLib());

let rpcCache: RpcCache = {};

const CACHE_FILE = path.join(__dirname, "cache.json");

function loadCacheFromFile() {
    if (fs.existsSync(CACHE_FILE)) {
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        rpcCache = JSON.parse(raw);
    }
}

async function refreshRpcCache() {
  console.log("🔄 Refreshing RPC data...");
  await generateRpcCache((chain, data) => {
    rpcCache[chain] = data;
  });

  console.log("✅ RPC data refreshed.");
}

setInterval(refreshRpcCache, 12 * 60 * 60 * 1000);

app.post("/rpc-check", (req, res) => {
    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ error: "Invalid JSON body" });
    }

    const { chains } = req.body;
    if (!Array.isArray(chains)) {
        return res.status(400).json({ error: "Missing chains: string[]" });
    }

    const data: RpcCache = {};
    for (const name of chains) {
        if (rpcCache[name]) {
            data[name] = rpcCache[name];
        }
    }

    return res.json(data);
});

app.listen(PORT, async () => {
    console.log(`🚀 RPC check server running on http://localhost:${PORT}`);
    loadCacheFromFile();
    await refreshRpcCache();
});

