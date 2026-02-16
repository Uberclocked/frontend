import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export function useNavBarUserOptionsLogic() {
  const {
    user,
    logout
  } = useAuth0();
  const navigate = useNavigate();
  return {
    user,
    logout,
    navigate,
  }
}

export default useNavBarUserOptionsLogic;

