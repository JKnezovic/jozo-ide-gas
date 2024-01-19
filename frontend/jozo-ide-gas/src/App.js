import "./App.css";
import api from "./api/axiosConfig";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Header from "./components/header/Header";
import OngoingTrips from "./components/ongoing-trips/OngoingTrips";
import PastTrips from "./components/past-trips/PastTrips";

function App() {
  const [trips, setTrips] = useState([]);

  const getTrips = async () => {
    try {
      const response = await api.get("/api/v1/trips");
      console.log(response.data);
      setTrips(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getTrips();
  }, []);
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/ongoing" element={<OngoingTrips />}></Route>
        <Route path="/done" element={<PastTrips />}></Route>
      </Routes>
    </div>
  );
}

export default App;
