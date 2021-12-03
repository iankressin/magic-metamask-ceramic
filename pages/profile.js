import { useState, useEffect, useCallback } from "react";
import {
  getProfile,
  updateProfile,
  createProfile
} from "../services/profile.service.js";

export default function Profile() {
  const [networkProfile, setNetworkProfile] = useState();
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    emoji: "",
    url: ""
  });
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  if (loading) return <h1>Loading</h1>;

  return (
    <div className="flex">
      <div className="w-1/2">
        <Editor
          showOnboarding={showOnboarding}
          profile={profile}
          fetchProfile={fetchProfile}
          setProfile={setProfile}
          setNetworkProfile={setNetworkProfile}
        />
      </div>
      <div className="w-1/2">
        <Viewer profile={networkProfile} />
      </div>
    </div>
  );
}

function Editor({
  profile,
  setProfile,
  setNetworkProfile,
  showOnboarding,
  fetchProfile
}) {
  const handleInputChange = event =>
    setProfile({ ...profile, [event.target.name]: event.target.value });

  const handleFormSend = async () => {
    try {
      showOnboarding
        ? await createProfile(profile)
        : await updateProfile(profile);

      await fetchProfile();
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  return (
    <>
      {showOnboarding ? (
        <h1>Let&apos;s create a profile for you</h1>
      ) : (
        <h1>Welcome back</h1>
      )}
      <div className="">
        <label>Name</label>
        <input
          className="block border-black border-2 rounded-md px-4 py-2 mb-4"
          name="name"
          value={profile.name}
          onChange={handleInputChange}
        />
      </div>

      <div className="">
        <label>Emoji</label>
        <input
          className="block border-black border-2 rounded-md px-4 py-2 mb-4"
          name="emoji"
          value={profile.emoji}
          onChange={handleInputChange}
        />
      </div>

      <div className="">
        <label>Description</label>
        <input
          className="block border-black border-2 rounded-md px-4 py-2 mb-4"
          name="description"
          value={profile.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="">
        <label>URL</label>
        <input
          className="block border-black border-2 rounded-md px-4 py-2 mb-4"
          name="url"
          value={profile.url}
          onChange={handleInputChange}
        />
      </div>

      <button
        className="block uppercase border-black border-2 rounded-md px-4 py-2"
        onClick={handleFormSend}
      >
        Sign In
      </button>
    </>
  );
}

function Viewer({ profile }) {
  return (
    <div>
      {Object.values(profile).map((value, index) => (
        <div className="mb-4" key={index}>
          <span className="">{value}</span>
        </div>
      ))}
    </div>
  );
}
