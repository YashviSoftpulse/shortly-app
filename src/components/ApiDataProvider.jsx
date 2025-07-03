import React, { useState, useEffect, createContext, useContext } from "react";
import { fetchData, getApiURL } from "../action";
const ApiDataContext = createContext(null);

export const useApiData = () => useContext(ApiDataContext);

const ApiDataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPlanPriceData = async () => {
    setLoading(true);
    const response = await fetchData(getApiURL("plan_check"));
    if (response?.status === true) setData(response);
    setLoading(false);
  };
  useEffect(() => {
    getPlanPriceData();
  }, []);

  return (
    <ApiDataContext.Provider value={{ data, loading, error }}>
      {children}
    </ApiDataContext.Provider>
  );
};

export default ApiDataProvider;
