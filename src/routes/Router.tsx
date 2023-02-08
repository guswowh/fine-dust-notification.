import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Gnb from '../components/Gnb';
import MyLocation from '../pages/MyLocation';
import Location from '../pages/Locations';
import Favorites from '../pages/Favorites';
import { useAppDispatch, useAppSelector } from '../store';
import ErrorPage from '../pages/ErrorPage';
import { asyncUpFetch, getFavoriteList } from '../store/slices/locationSlice';
import SingUp from '../pages/SignUp';
import SingIn from '../pages/SingIn';

function Router() {
  interface PostDataList {
    cityName: string;
    dateTime: string;
    fineDust: string;
    fineDustConcentration: string;
    isCheck: boolean;
    stationName: string;
  }

  interface UsersData {
    cityName: string;
    stationName: string;
    fineDust: string;
    dateTime: string;
    fineDustConcentration: string;
    isCheck: boolean;
  }

  const dispatch = useAppDispatch();
  const postDataPayload = useAppSelector(
    (state) => state.locationSlice.postData
  );
  const isLoadingPayload = useAppSelector(
    (state) => state.locationSlice.isLoading
  );
  const isErrorPayload = useAppSelector((state) => state.locationSlice.isError);
  const [cityName, setCityName] = useState('서울');
  const [locationFineDustInfo, setLocationFineDustInfo] = useState([
    {
      cityName: '',
      stationName: '',
      fineDust: '',
      dateTime: '',
      fineDustConcentration: '',
      isCheck: false,
    },
  ]);
  const [stationName, setStationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(asyncUpFetch(cityName));
    dispatch(getFavoriteList());
  }, [cityName, dispatch]);

  useEffect(() => {
    setIsLoading(isLoadingPayload);
  }, [isLoadingPayload]);

  useEffect(() => {
    if (isErrorPayload) {
      // navigate(0);
    }
  }, [isErrorPayload, navigate]);

  const checkedListDB = useAppSelector(
    (state) => state.locationSlice.checkedListDB
  );

  const userEmail = useAppSelector((state) => state.locationSlice.userEmail[0]);

  const [postDataList, setPostDataList] = useState<PostDataList[]>();

  useEffect(() => {
    const usersData: UsersData[] = postDataPayload.map((item) => {
      return {
        cityName: item.sidoName,
        stationName: item.stationName,
        fineDust: item.pm10Grade,
        dateTime: item.dataTime,
        fineDustConcentration: item.pm25Value,
        isCheck: false,
      };
    });

    setPostDataList(usersData);
  }, [cityName, postDataPayload]);

  useEffect(() => {
    const isCheckedListDB = checkedListDB.every((item) => {
      if (item[userEmail]) {
        return item[userEmail][cityName];
      }
      return false;
    });

    if (!isCheckedListDB) {
      if (postDataList) {
        setStationName(postDataList[0]?.stationName);
        setLocationFineDustInfo(postDataList);
      }
    } else if (checkedListDB.length) {
      const checkedList = { ...checkedListDB };
      if (postDataList) {
        setStationName(postDataList[0]?.stationName);
      }
      setLocationFineDustInfo(checkedList[0][userEmail][cityName]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postDataList, userEmail, cityName]);

  return (
    <>
      <Routes>
        <Route
          index
          element={
            <MyLocation
              cityName={cityName}
              setCityName={setCityName}
              locationFineDustInfo={locationFineDustInfo}
              stationName={stationName}
              setStationName={setStationName}
              isLoading={isLoading}
            />
          }
        />
        <Route
          path="location"
          element={
            <Location
              cityName={cityName}
              setCityName={setCityName}
              locationFineDustInfo={locationFineDustInfo}
              setLocationFineDustInfo={setLocationFineDustInfo}
              isLoading={isLoading}
            />
          }
        />
        <Route
          path="favorites"
          element={
            <Favorites
              locationFineDustInfo={locationFineDustInfo}
              setLocationFineDustInfo={setLocationFineDustInfo}
            />
          }
        />
        <Route path="signUp" element={<SingUp />} />
        <Route path="signIn" element={<SingIn />} />
        <Route path="errorPage" element={<ErrorPage />} />
      </Routes>
      <Gnb />
    </>
  );
}

export default Router;
