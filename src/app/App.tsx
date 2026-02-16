import { useEffect } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    initMercadoPago("TEST-dbeefbf1-09b0-4f59-97de-d4575669c873")
  }, [isAuthenticated, getAccessTokenSilently]);

  return (

    <RouterProvider router={router} />
  );
}

export default App;
