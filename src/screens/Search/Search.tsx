import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Box, Image, HStack, Input, VStack, Divider, ScrollView } from 'native-base';
import { apiSearch } from '@/apis/search';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import _header from '@/components/_header';
import _searchCard from './_searchCard';
// icon
import HomeSearch from '@/assets/icon/homeSearch.png';
import Back from '@/assets/icon/btnBack.png';
import User from '@/assets/icon/flatuser.png';
import Tnt from '@/assets/icon/renter-icon-outline.png';
import Prt from '@/assets/icon/flathome.png';
import Ins from '@/assets/icon/flatcalendar.png';
import AvatarRenter from '@/assets/icon/renter-icon.png';
import AvatarWhite from '@/assets/icon/avatarWhite.png';
import PrtWhite from '@/assets/icon/flathomeWhite.png';
import InsWhite from '@/assets/icon/flatcalendarWhite.png';
import { useAppSelector } from '@/state/hooks';

interface Query {
  q: string;
  type?: string;
}

const Search = ({ navigation }: any): React.JSX.Element => {
  const [search, setSearch] = useState<Query>({ q: '', type: '' });
  const [result, setResult] = useState<any | null>(null);
  const [active, setActive] = useState(0);
  const userData: any = useAppSelector(state => state.auth.userData);
  let type = '';

  const onChange = (data: string) => {
    type = active == 1 ? 'tenant' : active == 2 ? 'user' : active == 3 ? 'property' : active == 4 ? 'inspection' : '';
    setSearch({ q: data, type: type });
    if (data == '' || data == null) {
      setResult(null);
    }
  };


  const getSearch = async () => {
    const response = await apiSearch(search);
    // console.log('res: ',response.result);
    if (response.status) {
        setResult(response.result);
    }
  };
  const check = (t: string, data: any) => {
    switch (t) {
      case 'tenant':
        navigation.navigate('TenantDataEdit', data);
        setSearch({ q: '', type: '' });
        setResult(null);
        break;
      case 'user':
        navigation.navigate('EditManager', data);
        setSearch({ q: '', type: '' });
        setResult(null);
        break;
      case 'inspection':
        if (data.is_completed == 0) {
          navigation.navigate('Areas', data.id);
        } else {
          navigation.navigate('CompletedView', data?.id);
        }
        setSearch({ q: '', type: '' });
        setResult(null);
        break;
      case 'property':
        navigation.navigate('Details', data.id);
        setSearch({ q: '', type: '' });
        setResult(null);
        break;
      default:
        break;
    }
  };
  const handleActive = (act: number) => {
    if (act == active) {
      setActive(0);
    } else {
      setActive(act);
    }
    setSearch({ q: '', type: '' });
  };

  useEffect(() => {
    if (search.q != '' && search.q != null && search.q != ' ') {
      getSearch();
    }
    setResult(null);
  }, [search]);

  return (
      <ScrollView nestedScrollEnabled={true}>
    <Box style={styles.mainContainer}>
      <_header />
      <VStack>
        <HStack mt={5} space={2} style={styles.searchHead} >
          <Pressable onPress={() => { navigation.goBack(null); }}>
            <Image alt="back" source={Back} style={styles.backIcon} />
          </Pressable>
          <HStack space={0} mt={0} justifyContent={'flex-start'} alignItems={'center'} style={styles.searchContiner}>
            <Image source={HomeSearch} style={styles.icon} alt="icon" />
            <Input style={styles.input} placeholder="Search Your Properties, Task, Calendars"
              value={search.q} onChangeText={(e) => { onChange(e); }} />
          </HStack>
        </HStack>
        <ScrollView horizontal={true} pagingEnabled={false} style={{ backgroundColor: 'transparent', width: widthPercentageToDP('100%'), marginLeft: -20 }}>
          {userData.type == 'TENANT' &&
          <HStack space={3}>
            <Pressable onPress={() => { handleActive(3); }}>
            <HStack p={2} space={2} ml={3} style={active == 3 ? styles.categoryBoxActive : styles.categoryBox} justifyContent={'center'} alignItems={'center'}>
              <Image source={Prt} style={styles.categoryIcon} alt="icon" />
              <Text fontSize={'xs'}>Property</Text>
            </HStack>
          </Pressable>
            <Pressable onPress={() => { handleActive(4); }}>
              <HStack p={2} mr={2} space={2} style={active == 4 ? styles.categoryBoxActive : styles.categoryBox} justifyContent={'center'} alignItems={'center'}>
                <Image source={Ins} style={styles.categoryIcon} alt="icon" />
                <Text fontSize={'xs'}>Inspections</Text>
              </HStack>
            </Pressable>
          </HStack>
            }
          {userData.type != 'TENANT' &&
            <HStack space={2} justifyContent={'space-between'}>
              <Pressable onPress={() => { handleActive(1); }}>
                <HStack p={2} ml={2} space={2} style={active == 1 ? styles.categoryBoxActive : styles.categoryBox} justifyContent={'center'} alignItems={'center'}>
                  <Image source={Tnt} style={styles.categoryIcon} alt="icon" />
                  <Text fontSize={'xs'}>Renter</Text>
                </HStack>
              </Pressable>
              {userData.type == 'OWNER' &&
              <Pressable onPress={() => { handleActive(2); }}>
                <HStack p={2} space={2} style={active == 2 ? styles.categoryBoxActive : styles.categoryBox} justifyContent={'center'} alignItems={'center'}>
                  <Image source={User} style={styles.categoryIcon} alt="icon" />
                  <Text fontSize={'xs'}>User</Text>
                </HStack>
              </Pressable>
              }
              <Pressable onPress={() => { handleActive(3); }}>
                <HStack p={2} space={2} style={active == 3 ? styles.categoryBoxActive : styles.categoryBox} justifyContent={'center'} alignItems={'center'}>
                  <Image source={Prt} style={styles.categoryIcon} alt="icon" />
                  <Text fontSize={'xs'}>Property</Text>
                </HStack>
              </Pressable>
              <Pressable onPress={() => { handleActive(4); }}>
                <HStack p={2} mr={2} space={2} style={active == 4 ? styles.categoryBoxActive : styles.categoryBox} justifyContent={'center'} alignItems={'center'}>
                  <Image source={Ins} style={styles.categoryIcon} alt="icon" />
                  <Text fontSize={'xs'}>Inspections</Text>
                </HStack>
              </Pressable>
            </HStack>
          }
        </ScrollView>
      </VStack>
      <Divider style={{ marginLeft: -20, marginRight: -20, width: '140%' }} mt={3} />
      <VStack space={2} mt={2}>
        {result != null && result?.map((item: any, i: number) => {
          return (
            <Pressable key={i} onPress={() => { check(item.type, item.data); }}>
              {/* Ins */}
              {item.type == 'inspection' && <_searchCard item={item} image={InsWhite} />}
              {item.type == 'property' && <_searchCard item={item} image={PrtWhite} />}
              {item.type == 'tenant' && <_searchCard item={item} image={AvatarRenter} />}
              {item.type == 'user' && <_searchCard item={item} image={AvatarWhite} />}

            </Pressable>
          );
        })}

      </VStack>
    </Box>
      </ScrollView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    minHeight: heightPercentageToDP('100%'),
  },
  backIcon: {
    marginTop: 5,
    height: 40,
    width: 40,
  },
  searchHead: {
    width: '100%',
    height: 70,
  },
  searchContiner: {
    flex: 1,
    paddingLeft: 5,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(203, 203, 203, 0.9)',
    borderRadius: 30,
    height: 50,
  },
  icon: {
    height: 30,
    width: 30,
  },
  formControl: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 'auto',
    width: '100%',
    borderRadius: 8,
    // marginBottom: 20,
  },
  input: {
    flex: 1,
    color: 'black',
    borderWidth: 0,
    fontSize: 13,
  },
  categoryBox: {
    backgroundColor: 'rgba(242,238,233, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryBoxActive: {
    backgroundColor: 'rgba(242,238,233, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200,200,200, 0.9)',
    elevation: 3,
  },
  categoryIcon: {
    height: 20,
    width: 20,
    resizeMode: 'stretch',
  },
});

export default Search;
