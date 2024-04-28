import { useEffect, useState } from "react";
import TripDetails from "./TripDetails";
import { Routes, Route } from "react-router-dom";
import TripList from "./TripList";
import "./PastTrips.css";
import api from "../../api/axiosConfig";
import Loading from "../loading/Loading";
import ErrorMessage from "../loading/ErrorMessage";

const PastTrips = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getTrips = async () => {
    try {
      const response = await api.get("/api/v1/trips/done");
      setTripData(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError(true);
      setLoading(false);
    }
  };
  useEffect(() => {
    getTrips();
  }, []);
  return loading ? (
    <Loading />
  ) : error ? (
    <ErrorMessage />
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
