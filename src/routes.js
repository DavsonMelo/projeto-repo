import { HashRouter, Routes, Route } from "react-router-dom";
import React from "react";

import Main from "./pages/Main";
import Repositorio from "./pages/Repositorio";

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route exact path="/repositorio/:repositorio" element={<Repositorio />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
