import { create } from "zustand";

interface subcription {
  status: "free" | "pro";
  expiryDate: string | null;
}

interface SubscriptionStore {
  subscription: subcription | null;
  isLoading: boolean;
  error: string | null;

  setSubscription: (newSubscription: subcription | null) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription: null,
  isLoading: false,
  error: null,

  setSubscription: (newSubscription) => {
    set({
      subscription: newSubscription,
      error: null,
    });
  },
}));
