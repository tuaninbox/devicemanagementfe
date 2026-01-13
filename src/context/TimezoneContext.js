import { createContext } from "react";

export const TimezoneContext = createContext({
  timezone: "Australia/Perth",
  setTimezone: () => {},
});
