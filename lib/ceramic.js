import { DID } from "dids";
import Ceramic from "@ceramicnetwork/http-client";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdConnect, EthereumAuthProvider } from "@3id/connect";

export const ceramic = new Ceramic(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

const resolver = {
  ...ThreeIdResolver.getResolver(ceramic)
};

const did = new DID({ resolver });
ceramic.did = did;

const threeIdConnect = new ThreeIdConnect();

export async function setProvider(walletAddress, provider) {
  const ethereumProvider = provider ? provider : window.ethereum;

  const authProvider = new EthereumAuthProvider(
    ethereumProvider,
    walletAddress
  );

  await threeIdConnect.connect(authProvider);
  const didProvider = await threeIdConnect.getDidProvider();

  if (!ceramic || !ceramic.did) {
    console.error("Ceramic instance or DID has not been configured.");
    return;
  }

  ceramic.did.setProvider(didProvider);
}

export function isCeramicAuthenticated() {
  return ceramic.did.authenticated;
}

export function authenticateCeramic() {
  return ceramic.did.authenticate();
}
