import { useRouter } from "next/router";
import { useState } from "react";
import { signIn } from "../lib/auth.js";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async method => {
    try {
      const id = await signIn({ method, email });
      router.push("/profile");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="flex">
      <div className="block border-black border-2 p-8 w-96 rounded-lg mr-8">
        <input
          className="block border-black border-2 rounded-md px-4 py-2 mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          className="block uppercase border-black border-2 rounded-md px-4 py-2"
          onClick={() => handleSignin("magic")}
        >
          Sign in with email
        </button>
      </div>

      <div className="block border-black border-2 p-8 w-96 rounded-lg">
        <button
          className="block uppercase border-black border-2 rounded-md px-4 py-2"
          onClick={() => handleSignin("metamask")}
        >
          Sign in with Metamask
        </button>
      </div>
    </div>
  );
}
