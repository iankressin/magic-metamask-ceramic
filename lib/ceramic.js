import { DID } from "dids";
import Ceramic from "@ceramicnetwork/http-client";
import KeyDidResolver from "key-did-resolver";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdConnect, EthereumAuthProvider } from "@3id/connect";

export const ceramic = new Ceramic(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

const resolver = {
  ...ThreeIdResolver.getResolver(ceramic),
  ...KeyDidResolver.getResolver()
};

export async function setProvider(walletAddress, provider) {
  const threeIdConnect = new ThreeIdConnect();
  const ethereumProvider = provider ? provider : window.ethereum;
  const authProvider = new EthereumAuthProvider(
    ethereumProvider,
    walletAddress
  );

  await threeIdConnect.connect(authProvider);
  const didProvider = await threeIdConnect.getDidProvider();

  const did = new DID({ resolver, provider: didProvider });
  ceramic.did = did;
}

export function isCeramicAuthenticated() {
  if (!ceramic.did) return false;

  return ceramic.did.authenticated;
}

export function authenticateCeramic() {
  return ceramic.did.authenticate();
}
