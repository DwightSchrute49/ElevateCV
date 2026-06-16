import { createContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ childern }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider value={(user, setUser, loading, setLoading)}>
      {childern}
    </AuthContext.Provider>
  );
};
