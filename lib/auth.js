import { Magic } from "magic-sdk";
import {
  ceramic,
  setProvider,
  authenticateCeramic,
  isCeramicAuthenticated
} from "./ceramic.js";

export async function signIn({ method, email }) {
  if (isCeramicAuthenticated()) return ceramic.did.id;

  if (method === "magicLink") await magicSignIn(email);
  else if (method === "metamask") await metamaskSignIn();
  else throw Error("Invalid authentication method");

  return await authenticateCeramic();
}

async function magicSignIn(email) {
  const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);

  await magic.auth.loginWithMagicLink({
    email
  });

  const meta = await magic.user.getMetadata();

  await setProvider(meta.publicAddress, magic.rpcProvider);
}

async function metamaskSignIn() {
  const addresses = await getWalletAddress();

  await setProvider(addresses[0]);
}

export async function getWalletAddress() {
  try {
    return await window.ethereum.enable();
  } catch (err) {
    console.log("MetaMask not installed");
  }
}
