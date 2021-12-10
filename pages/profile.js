import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { isCeramicAuthenticated } from "../lib/ceramic";
import Spinner from "../components/Spinner";
import {
  getProfile,
  updateProfile,
  createProfile
} from "../services/profile.service.js";

export default function Profile() {
  const router = useRouter();
  const [networkProfile, setNetworkProfile] = useState();
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    emoji: "",
    url: ""
  });
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isCeramicAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const userProfile = await getProfile();

      if (userProfile) {
        setProfile(userProfile);
        setNetworkProfile(userProfile);
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => fetchProfile(), [fetchProfile]);

  if (loading || !networkProfile) return <h1>Loading</h1>;

  return (
    <>
      <h2 className="m-8 text-2xl font-bold">🖋 Basic Profile Editor</h2>
      <div>
        {showOnboarding ? (
          <h1 className="text-center mt-2 text-4xl font-bold mt-16 mb-16">
            Let&apos;s create a profile for you
          </h1>
        ) : (
          <h1 className="text-center mt-2 text-4xl font-bold mt-16 mb-16">
            Welcome back
          </h1>
        )}
      </div>
      <div className="flex">
        <div className="w-1/2 flex items-center justify-end mr-16">
          <Editor
            showOnboarding={showOnboarding}
            profile={profile}
            fetchProfile={fetchProfile}
            setProfile={setProfile}
            setNetworkProfile={setNetworkProfile}
          />
        </div>
        <div className="w-1/2 flex justify-start ml-16">
          <Viewer profile={networkProfile} />
        </div>
      </div>
    </>
  );
}

function Editor({
  profile,
  setProfile,
  setNetworkProfile,
  showOnboarding,
  fetchProfile
}) {
  const [loading, setLoading] = useState(false);
  const handleInputChange = event =>
    setProfile({ ...profile, [event.target.name]: event.target.value });

  const handleFormSend = async () => {
    try {
      setLoading(true);

      showOnboarding
        ? await createProfile(profile)
        : await updateProfile(profile);

      await fetchProfile();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="block border-black border-2 p-8 w-96 rounded-lg mr-8 flex flex-col">
        <div className="">
          <label className="font-bold">Name</label>
          <input
            className="block border-black border-2 rounded-md px-4 py-2 mb-4 w-full"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="">
          <label className="font-bold">Emoji</label>
          <input
            className="block border-black border-2 rounded-md px-4 py-2 mb-4 w-full"
            name="emoji"
            value={profile.emoji}
            onChange={handleInputChange}
          />
        </div>

        <div className="">
          <label className="font-bold">Description</label>
          <input
            className="block border-black border-2 rounded-md px-4 py-2 mb-4 w-full"
            name="description"
            value={profile.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="">
          <label className="font-bold">Url</label>
          <input
            className="block border-black border-2 rounded-md px-4 py-2 mb-4 w-full"
            name="url"
            value={profile.url}
            onChange={handleInputChange}
          />
        </div>

        <button
          className="block uppercase border-black border-2 rounded-md px-4 py-2 mt-8 flex justify-center items-center"
          onClick={handleFormSend}
        >
          {loading ? <Spinner /> : "Update"}
        </button>
      </div>
    </div>
  );
}

function Viewer({ profile }) {
  return (
    <div className="block border-black border-2 p-8 w-96 rounded-lg mr-8 flex flex-col">
      {Object.keys(profile).map((key, index) => (
        <div className="mb-8 block" key={index}>
          <label className="block mb-1 font-bold capitalize">{key}</label>
          <span className="block">{profile[key]}</span>
        </div>
      ))}
    </div>
  );
}
