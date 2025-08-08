import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import MovieList from "./components/MovieList";
import MovieForm from "./components/MovieForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastContainer from "./components/ToastContainer";
import "./i18n";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <MovieList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies/create"
            element={
              <ProtectedRoute>
                <MovieForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies/edit/:id"
            element={
              <ProtectedRoute>
                <MovieForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/movies" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
