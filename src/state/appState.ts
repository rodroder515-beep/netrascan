import { NavTab } from '../components/Navbar';

export interface AppState {
  activeTab: NavTab;
  hasSeenIntro: boolean;
  isOfflineReady: boolean;
  facility: {
    id: string;
    name: string;
    operatorRole: string;
  };
}

export const initialAppState: AppState = {
  activeTab: 'dashboard',
  hasSeenIntro: false,
  isOfflineReady: true,
  facility: {
    id: 'PHC-01',
    name: 'Primary Health Centre 01',
    operatorRole: 'ASHA',
  },
};
