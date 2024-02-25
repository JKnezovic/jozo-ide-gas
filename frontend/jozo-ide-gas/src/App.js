import "./App.css";
import "react-photo-view/dist/react-photo-view.css";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Header from "./components/header/Header";
import OngoingTrips from "./components/ongoing-trips/OngoingTrips";
import PastTrips from "./components/past-trips/PastTrips";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/ongoing" element={<OngoingTrips />}></Route>
        <Route path="/done/*" element={<PastTrips />}></Route>
      </Routes>
    </div>
  );
}

export default App;
