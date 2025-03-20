import Cookies from "js-cookie";
import { create, type StateCreator } from "zustand";

export type Portal = "user" | "business";

export interface PortalState {
  currentPortal: Portal;
  setPortal: (portal: Portal) => void;
}

const createPortalSlice: StateCreator<PortalState> = (set) => ({
  currentPortal: (Cookies.get("portal") as Portal) || "user",
  setPortal: (portal: Portal) => {
    Cookies.set("portal", portal);
    set({ currentPortal: portal });
  },
});

export const usePortalStore = create<PortalState>()(createPortalSlice);
