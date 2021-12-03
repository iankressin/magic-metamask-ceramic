import { datastore, definitions } from "../lib/data-store";

export const createProfile = props => {
  return datastore.set("basicProfile", { ...props });
};

export const updateProfile = props => {
  return datastore.merge("basicProfile", { ...props });
};

export const getProfile = id => {
  return datastore.get("basicProfile", id);
};
