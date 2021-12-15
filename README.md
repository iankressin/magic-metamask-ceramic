# (Magic || MetaMask) + Ceramic

This is a sample repo on how to integrate Magic Link, MetaMask as authentication methods for Ceramic in order to perform write operations on documents. The goal is to integrate all the moving parts and allow users to edit the information of their `basicProfile` schema.

Live at https://magic-metamask-ceramic.vercel.app/

## Installation

For this integration we will need the following packages:

```
npm i --save \
@3id/connect \
@ceramicnetwork/3id-did-resolver \
key-did-resolver \
@ceramicnetwork/http-client \
@glazed/datamodel \
@glazed/did-datastore \
dids \
magic-sdk
```

## Magic's API key

### Ceramic authentication

You will also need the publishable API keys from your project, which you can get at Magic's [dashboard](https://dashboard.magic.link)

## Code

First things first, we need to create a Ceramic instance and a resolver object.
On Ceramic network, most of the times streams are signed with `3id`. Although, `key-did` could be appear out there in a few documents, so we create our resolver with both `key-did` and `3id` resolvers.

```js
const ceramic = new Ceramic(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

const resolver = {
  ...ThreeIdResolver.getResolver(ceramic),
  ...KeyDidResolver.getResolver()
};
```

We also want to create an instance of `ThreeIdConnect`, which provides [3ID account management in a iframe](https://github.com/ceramicstudio/3id-connect)

```js
const threeIdConnect = new ThreeIdConnect();
```

Now we need to set the DID provider to newly created `threeIdConnect` instance, which is responsible signing messages in order to create a [Ceramic flavoured DID (3ID)](https://github.com/ceramicnetwork/js-ceramic/blob/90973ee32352e260cb040e687720095b145b4702/docs-src/guides/add-new-blockchain.md#overview-ceramic-and-blockchain-accounts).
In order to create the DID provider, we will need an instance of a blockchain authentication provider, in this example we are going to use `EthereumAuthProvider`, for the Ethereum network.
Let's create a function that will receive a Ethereum provider and user's wallet address and use it to create the DID provider and using it as Ceramic's DID provider.
Finally, we can creat a new instance of DID set it to `ceramic.did`

```js
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
```

By default our function will use MetaMask Ethereum provider available on the window object, as long as MetaMask extension is installed.

After we have our provider in place, we need to authenticate Ceramic using the 3ID iframe

```js
export function authenticateCeramic() {
  return ceramic.did.authenticate();
}
```

[Full code](https://github.com/iankressin/magic-ceramic/blob/main/lib/ceramic.js)

### Magic || MetaMask

The next step is to create the method that will act as a hub for authentication, which will receive the desired authentication method, either `metamask` or `magic` and will handle each of these cases by setting different providers to our ceramic object.

```js
export async function signIn({ method, email }) {
  if (isCeramicAuthenticated()) return ceramic.did.id;

  if (method === "magicLink") await magicSignIn(email);
  else if (method === "metamask") await metamaskSignIn();
  else throw Error("Invalid authentication method");

  return await authenticateCeramic();
}
```

The first line of this function, we check if Ceramic is already authenticated, if it is we will return the ceramic.did.id. After, we check what is the authentication method picked by the user, and follow the respective execution path.

#### Magic

We need now to handle both authentication methods. Let's start with `magic`.

```js
async function magicSignIn(email) {
  const magic = new Magic("API_KEY");

  await magic.auth.loginWithMagicLink({
    email
  });

  const meta = await magic.user.getMetadata();

  await setProvider(meta.publicAddress, magic.rpcProvider);
}
```

Here we create a new instance of Magic's class, passing the API key the we got from Magic's dashboard.
Next we call the `magic.auth.loginWithMagicLink` that will send users an email to confirm the sign in and automatically creates an account in case of this is the first sign in.
The promise is fulfilled when the user clicks the link in their email. After that we will have access to the `meta` object, which provides an Ethereum public address for each account.
The last piece missing to integrate Magic and Ceramic is an Ethereum provider, that luckily enough is provided by the magic instance and can be accessed by `magic.rpcProvider`

#### MetaMask

For MetaMask, the method is fairly simple since we are already using the `window.ethereum` as our default provider, we just need to request the wallet address to the extension and pass it to the `setProvider` function.

```js
async function metamaskSignIn() {
  const addresses = await getWalletAddress();

  await setProvider(addresses[0]);
}
```

The wallet address can be request by

```js
export async function getWalletAddress() {
  try {
    return await window.ethereum.enable();
  } catch (err) {
    console.log("MetaMask not installed");
  }
}
```

[Full code](https://github.com/iankressin/magic-ceramic/blob/main/lib/auth.js)

Now we can call our `signIn` function to authenticate users using either Magic or Metamask!
