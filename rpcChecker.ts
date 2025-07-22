import axios from "axios";
import mainnet from "chain-registry/mainnet";
import testnet from "chain-registry/testnet";
import fs from "fs";
import path from "path";

export type RpcResult = {
  chain: string;
  url: string;
  latency: number | null;
  status: "OK" | "ERROR" | "FAIL";
  message?: string;
};

export type RpcCache = Record<string, RpcResult[]>;

const CACHE_FILE = path.join(__dirname, "cache.json");

function saveCacheToFile(cache: RpcCache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

async function checkRpcLatency(chain: string, url: string): Promise<RpcResult> {
  const start = Date.now();
  try {
    const response = await axios.get(`${url}/status`, { timeout: 5000 });
    const latency = Date.now() - start;
    if (response.status === 200) {
      return { chain, url, latency, status: "OK" };
    } else {
      return {
        chain,
        url,
        latency,
        status: "ERROR",
        message: `Status code ${response.status}`,
      };
    }
  } catch (error: any) {
    return { chain, url, latency: null, status: "FAIL", message: error.message };
  }
}

export async function generateRpcCache(updateCallback?: (chain: string, result: RpcResult[]) => void): Promise<RpcCache> {
  const results: RpcCache = {};

  const chains = [...mainnet.chains, ...testnet.chains];

  for (const chain of chains) {
    const chainName = chain.chainName;
    const rpcs = chain.apis?.rpc?.map((rpc) => rpc.address) || [];
    
    const chainResults: RpcResult[] = [];

    for (const url of rpcs) {
      const res = await checkRpcLatency(chainName, url);
      chainResults.push(res);
    }

    chainResults.sort((a, b) => {
      if (a.latency === null) return 1;
      if (b.latency === null) return -1;
      return a.latency - b.latency;
    });

    results[chainName] = chainResults;

    if (updateCallback) {
      updateCallback(chainName, chainResults);
    }
    saveCacheToFile(results);
  }

  return results;
}
