import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';
import { propertyList , InspectionGet, Sign} from '@/services/types';

interface PropertyState {
    list: propertyList | null;
    inspection: InspectionGet | null;
    inspectorSign: Sign | null;
    tenantSign: Sign | null;
    sideBar: boolean;
    homeMode?: boolean;
  }

  const initialState: PropertyState = {
    list: null,
    inspection: null,
    inspectorSign: null,
    tenantSign: null,
    sideBar: false,
    homeMode: false,
  };

const propertySlice = createSlice({
    name: 'propertySlice',
    initialState,
    reducers: {
        setList: (state, action: PayloadAction<any>) => {
            state.list = action.payload;
        },
        setInspection: (state, action: PayloadAction<InspectionGet | null>) => {
            state.inspection = action.payload;
        },
        setInspectorSign: (state, action: PayloadAction<Sign | null>) => {
            state.inspectorSign = action.payload;
        },
        setTenantSign: (state, action: PayloadAction<Sign | null>) => {
            state.tenantSign = action.payload;
        },
        setSideBar: (state, action: PayloadAction<boolean>) => {
            state.sideBar = action.payload;
        },
        setHomeMode: (state, action: PayloadAction<boolean>) => {
            state.homeMode = action.payload;
        },
    },
});

export const { setList, setInspection, setInspectorSign, setTenantSign, setSideBar,setHomeMode } = propertySlice.actions;

export default propertySlice.reducer;
