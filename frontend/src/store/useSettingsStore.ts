import { create } from 'zustand';
import api from '../services/api';

interface SettingsStore {
    settings: any;
    fetchSettings: () => Promise<void>;
    updateSettingsLocally: (newSettings: any) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
    settings: {},
    fetchSettings: async () => {
        try {
            const res = await api.get('/settings');
            set({ settings: res.data });
        } catch (e) {
            console.error("Failed to fetch settings", e);
        }
    },
    updateSettingsLocally: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
    }))
}));

export default useSettingsStore;
