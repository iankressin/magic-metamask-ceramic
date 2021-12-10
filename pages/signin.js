import { useRouter } from "next/router";
import { useState } from "react";
import { signIn } from "../lib/auth.js";
import Spinner from "../components/Spinner";
import Image from "next/image";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async method => {
    try {
      setLoading(true);
      const id = await signIn({ method, email });
      router.push("/profile");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-center mt-24 text-6xl font-bold">🖋</h1>
      <h1 className="text-center mt-2 text-4xl font-bold">
        Basic Profile Editor
      </h1>
      <div className="flex w-full h-full justify-center items-center mt-24">
        <div className="block border-black border-2 p-8 w-96 rounded-lg mr-8 h-96 flex flex-col">
          <div className="flex items-center justify-center">
            <Image src="/magic-link.png" alt="magic" width="200" height="100" />
          </div>
          <input
            className="block border-black border-2 rounded-md px-4 py-2 mb-4 w-full mt-8"
            value={email}
            placeholder="email@provider.com"
            onChange={e => setEmail(e.target.value)}
          />
          <button
            className="block uppercase border-black border-2 rounded-md px-4 py-2 flex justify-center items-center"
            onClick={() => handleSignin("magic")}
          >
            {loading ? <Spinner /> : "Sign in with Magic"}
          </button>
        </div>

        <div className="block border-black border-2 p-8 w-96 rounded-lg h-96 flex flex-col">
          <Image src="/metamask.svg" alt="magic" width="100" height="100" />

          <button
            className="block uppercase border-black border-2 rounded-md px-4 py-2 mt-8 flex justify-center items-center"
            onClick={() => handleSignin("metamask")}
          >
            {loading ? <Spinner /> : "Sign in with MetaMask"}
          </button>
        </div>
      </div>
    </>
  );
}
