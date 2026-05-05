import React from "react";
import SignInForm from "@/components/SignInForm";

export const metadata = {
  metadataBase: new URL("https://www.thetorontosaunaco.com"),
  alternates: {
    canonical: "/signin",
  },
  title: "Sign in | Toronto Sauna Co.",
  robots: { index: false, follow: true },
};

const page = () => {
  return (
    <div>
      <SignInForm />
    </div>
  )
}

export default page;

