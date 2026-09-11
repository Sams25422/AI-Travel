/**
 * Client config for the Atlas agent proxy (never put API keys here).
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra || {}) as {
  atlasAgentUrl?: string;
};

/** Local agent proxy. Override with EXPO_PUBLIC_ATLAS_AGENT_URL. */
export const ATLAS_AGENT_URL =
  process.env.EXPO_PUBLIC_ATLAS_AGENT_URL ||
  extra.atlasAgentUrl ||
  'http://localhost:8787';
