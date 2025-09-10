import { PaidClient } from "@paid-ai/paid-node";
import { PAID_API_URL } from "../constants";

let client: PaidClient | null = null;
let isInitialized: boolean = false;

export async function getClient(): Promise<PaidClient> {
  const apiToken = process.env.PAID_API_KEY ?? "";

  if (!apiToken) {
    throw new Error('api token missing: either set a PAID_API_KEY env variable or add a token to the code above');
  }

  if (!client) {
    try {
      client = new PaidClient({ token: apiToken, baseUrl: `${PAID_API_URL}/api/v1/` });
    } catch (error) {
      console.error('Failed to initialize PaidClient:', error);
      throw new Error('PaidClient initialization failed');
    }
  }

  if (!isInitialized) {
    await client.initializeTracing();
    isInitialized = true;
  }

  return client;
}
