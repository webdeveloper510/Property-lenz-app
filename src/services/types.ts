/* Context */
export type AuthContextType = {
  logout?: () => void;
}
/* Api Responses */
export type ResponseObject<T> = {
  status: boolean
  result: T,
  message: string,
}
type Pagination = {
  page_no? : number,
  per_page? : number,
  total_pages? : number,
  total_results? : number,
}

/* Auth User Data */
export type Subscription = {
  id: number;
  title: string;
  description: string;
  amount: number;
  allowed_properties: number;
  allowed_users: number;
  has_trial: number | null;
  trial_days: number | null;
  is_active: number;
  created_at: string | Date;
  updated_at: string | null;
  deleted_at: string | null;
  is_trial_package: number;
  ios_product_id?: string | number;
  interval?: string;
  start_date?: number;
  trial_end?: any | null;
  is_canceled?: number | null;
}
export type UserDataObject = {
  id: number;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone: any | null,
  dp: string | null,
  type: string,
  authToken: string;
  check_location?: number;
  subscriptionPackage?: Subscription | null;
}
export type SocialLogin = {
	uid: string;
	first_name: string;
	email: string;
	device_type: string;
	platform: string;
	fcm_token: any;
}

export type UserData = {
  id?: number;
  owner_id?: number;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string  | null,
  mobile?: string | null,
  dp?: any | null,
  address?: string,
  address_line_2?: string,
  city?: string | null;
  state?: string | null;
  zip?: any | null;
  country?: string | null;
  tax_id?: any;
  token?: string;
}
export type StaffData = {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}
export type Profile = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  dp: string  | null;
  address: string | null;
  address_line_2: string;
  city: string;
  country: string;
  mobile: string;
  phone: string;
  state: string | null;
  tax_id?: string | null;
  zip: string | null;
}
export type UpdatePassword = {
  id: number;
  password: string;
  new_password: string;
  confirm_password: string;
}

export type LoginData = {
  email: string
  password: string
}

export type ResetPasswordData = {
  token: string | undefined
  email?: string
  new_password: string
  confirm_password: string
}

export type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
}


// Calendar data
export type DateObject = {
  [key: string]: {
    selected?: boolean;
    marked?: boolean;
    event?: string;
    dsc?: string;
    selectedColor?: string;
  };
};
export type DataArray = {
  date: string;
  event?: string;
  dsc?: string;
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
}[];
export type propertyGet = {
  id: number;
  owner_id?: number;
  manager_id?: number;
  created_by?: number;
  type: string;
  name: string;
  location?: string | null;
  address?: string;
  address_line_2?: string;
  city?: string | null;
  state?: string | null;
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  cover_image?: string;
  notes?: string;
  areas?: any[];
}

type Item = {
  inspection_id: number;
  area_id: number;
  item_id: number;
  status: string;
  comments: string | null;
  is_enable: number;
  name: string;
  images: { image: string }[];
};
type Property = {
  id: number;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
};
type Tenant = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
};
type Area = {
  inspection_id: number;
  area_id: number;
  property_area_id: number;
  is_enable: number;
  order: number;
  is_completed?: number;
  title: string;
  sub_title: string;
  items: Item[];
};
export type InspectionGet = {
  id: number;
  property_id: number;
  created_by: number;
  created_by_name: string;
  created_by_email?: string;
  created_by_phone?: string;
  inspected_by: number;
  inspected_by_name: string;
  tenant_id?: number | null;
  activity: string;
  is_signed: number;
  signed_at: string | null;
  inspection_date: string;
  created_at: string;
  updated_at?: string | null;
  final_comments?: string | null;
  optional_comments?: string | null;
  inspector_sign?: string | null;
  tenant_sign?: string | null;
  is_completed?: number | string | null;
  complete_at?: string | null;
  property: Property;
  tenant?: Tenant | null;
  areas: Area[];
}

export type metaInfo = {
  total_pages: number;
  per_page: number;
  page_no: number;
  total_results: number;
}
export type propertyList = {
  id: any;
  data: propertyGet;
  meta_info: metaInfo;
}
export type detailsData = {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  }
  formatted_address: string;
}
export type addProperty = {
  type: string;
  name: string;
  location: string;
  address: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip?: string;
  country: string;
  latitude: number;
  longitude: number;
  notes?: string;
  cover_image?: string;
  areas: any;
}
export type AddInspectionRes = {
  id: number;
  property_id: number | string;
  created_by: number | string;
  inspected_by: number | string;
  tenant_id?: number | string;
  activity: string;
  inspection_date: string;
  created_at: string;
}

export type AddInspectionPay = {
  property_id: number | string;
  inspected_by: number | string;
  tenant_id?: any[];
  activity: string;
  inspection_date: string;
  is_renter_self_led:boolean;
  is_renter_present:boolean;
  inspection_due_date:string
}
interface CalendarData {
  id: number;
  name: string;
  property_id: number;
  created_by: number;
  inspected_by: number;
  tenant_id: number;
  activity: string;
  inspection_date: string;
  created_at: string;
  updated_at: string | null;
  final_comments: string | null;
  inspector_sign: string | null;
  tenant_sign: string | null;
  is_completed: number;
  complete_at: string | null;
  tenants: {
	id: string
	email: string
	first_name: string
	last_name: string
  }[]
}
interface CalendarEntry {
  type: string;
  data: CalendarData;
}
export type CalendarResult = {
  [date: string]: CalendarEntry[];
}
export type Templates ={
  id: number;
  type: string;
  owner_id: number;
  is_default: number;
  has_bedroom: number;
  has_bathroom: number;
  areas: NewAreas[];
}
export type NewAreas = {
  id: number;
  title: string;
  area_id?: number;
  is_common: number;
  is_custom: boolean;
  property_id: number;
  created_at: string | null;
  updated_at: string | null;
  sub_title?: string | null;
}
export type NewItem = {
  id: number;
  area_id?: number;
  name: string;
}

export type Sign = {
  data: string;
  path: string;
}
export type SearchTenant = {
  id?: number;
  owner_id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  mobile?: string | null;
  address?: string;
  address_line_2?: string | null;
  city?: string;
  state?: string;
  zip?: string | null;
  country?: string;
  created_at?: string;
  updated_at?: string | null;
}[]

export type PropertyLease = {
  status: string;
  start_date: string;
  end_date: string;
  is_movein_invited: number;
  move_in_date: string | null;
  movein_status: string | null;
  move_out_date: string | null;
  sign_status: string | null;
  rent: number | null;
  comments: string | null;
  created_at: string;
  updated_at: string | null;
  tenant_first_name: string;
  tenant_last_name: string;
  property_name: string;
}[]

export type TimeLineItem = {
  message: string;
  action: string;
  property_id?: number;
  inspection_id?: number | null;
  lease_id?: number | null;
  is_completed?: number | null;
  property_activity_images_id?: number | null;
  priority?: number | null;
  image_action?: String | null;
  activity?: String | null;
  comments?: String | null;
  image?: String;
};

export type TimeLine = {
  type: string;
  data: TimeLineItem;
};

export type TimeLineDate = {
  [date: string]: TimeLine[];
};
export type Create_Tenant = {
  id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  status:number;
  company:string;
  // address: string;
  address_line_2?: string;
  mobile?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  property_ids:any[];
  notes:string;
  country_code:string
}
export type SearchData ={
  id: number;
    owner_id: number;
    phone?: number;
    mobile?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    address?: string;
    address_line_2?: string | null;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    manager_id?: number;
    created_by?: number;
    type?: string;
    name?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    cover_image?: string;
    notes?: string | null;
    created_at?: string;
    updated_at?: string | null;
}

export type SearchType = {
  type: string;
  data: SearchData
}[]

export type actionType = {
  inspection: {
    id: number;
    name: string;
    inspection_date: string;
    is_completed?: number;
    type: string;
  }[],
  lease: {
    id: number;
    tenant_first_name: string;
    tenant_last_name: string;
    property_name: string;
    movein_disable_on: string;
    type: string;
  }[],
  property: {
    id: number;
    name: string;
    address: string;
    created_at: string;
    type: string;
  }[],
  all: any[],
}

export type Plan = {
  id: number;
  title: string;
  description: string;
  amount: number;
  allowed_properties: number;
  allowed_users: number;
  has_trial: boolean;
  trial_days: number;
  is_active: boolean;
  stripe_price_id: string;
  stripe_price_data: {
    currency: string;
    interval: string;
  };
};
export type MyManagers = {
  id: number;
  owner_id: number;
  status: number;
  is_verified: number;
  owner_name: string;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  phone: number | null;
}
export type MyTenants = {
  id: number;
  owner_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  mobile: string;
  address: string;
  address_line_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  auth_token?: string | null;
  code?: string;
  fcm_token?: string | null;
  device_type?: string | null;
}

export type ManagerResponse = {
  data: MyManagers[];
  meta_info: Pagination
}
export type TenantResponse = {
  data: MyTenants[];
  meta_info: Pagination
}
