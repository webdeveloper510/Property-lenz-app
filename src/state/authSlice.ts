import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  UserDataObject,
  Profile,
  Subscription,
} from '@/services/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  userData: UserDataObject | null;
  profileData: Profile | null;
  userPackage: Subscription | null;
  loggedIn: boolean;
}

const initialState: AuthState = {
  userData: null,
  userPackage: null,
  profileData: null,
  loggedIn: false,
};
const settingUserData = async (data: UserDataObject)=>{
  await AsyncStorage.setItem('@userData', JSON.stringify(data));
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<UserDataObject | null>) {
      state.userData = action.payload;
      action.payload != null && settingUserData(action.payload);
    },
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.loggedIn = action.payload;
    },
    setPackage(state, action: PayloadAction<Subscription | null>) {
      state.userPackage = action.payload;
    },
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profileData = action.payload;
    },
  },
});

export const { setUserData, setLoggedIn, setProfile, setPackage } = authSlice.actions;


export default authSlice.reducer;
