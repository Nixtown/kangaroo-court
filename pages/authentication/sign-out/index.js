import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "/lib/supabaseClient";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const logoutUser = async () => {
      await supabase.auth.signOut();
      router.push("/authentication/sign-in/basic"); // Redirect to sign-in page
    };

    logoutUser();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Logging you out...</h2>
    </div>
  );
};

export default Logout;
