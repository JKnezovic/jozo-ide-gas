import { useEffect, useState } from "react";
import TripDetails from "./TripDetails";
import { Routes, Route } from "react-router-dom";
import TripList from "./TripList";
import "./PastTrips.css";
import api from "../../api/axiosConfig";
import Loading from "../loading/Loading";
const PastTrips = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTrips = async () => {
    try {
      const response = await api.get("/api/v1/trips");
      setTripData(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    getTrips();
  }, []);
  return loading ? (
    <Loading />
  ) : (
    <div>
      <Routes>
        <Route path="/" element={<TripList tripData={tripData} />} />
        <Route path=":tripName" element={<TripDetails tripData={tripData} />} />
      </Routes>
    </div>
  );
};

export default PastTrips;
