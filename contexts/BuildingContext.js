import React, { createContext, useContext, useState } from "react";

const BuildingContext = createContext();

export function BuildingProvider({ children }) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const value = {
    selectedBuilding,
    setSelectedBuilding,
  };

  return (
    <BuildingContext.Provider value={value}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuilding() {
  const context = useContext(BuildingContext);
  if (!context) {
    throw new Error("useBuilding must be used within a BuildingProvider");
  }
  return context;
}
