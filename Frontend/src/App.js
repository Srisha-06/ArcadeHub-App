import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";
import { Register } from "./Register";
import { Dashboard } from "./Dashboard";
import { Puzzle } from "./Puzzle";
import { Memory } from "./Memory";
import { Uno } from "./Uno";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/uno" element={<Uno />} />
      </Routes>
    </BrowserRouter>
    
  );
};