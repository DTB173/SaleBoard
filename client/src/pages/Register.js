import { SignUp } from "@clerk/clerk-react";

export default function Register() {
  return(
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
    <SignUp />
  </div>
  );
}