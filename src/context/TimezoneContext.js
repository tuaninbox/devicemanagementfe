import { createContext, useState } from "react";

export const TimezoneContext = createContext({
  timezone: "Australia/Perth",
  setTimezone: () => {},
});

export function TimezoneProvider({ children }) {
  const [timezone, setTimezone] = useState("Australia/Perth");

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}
