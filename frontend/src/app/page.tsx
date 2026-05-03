"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isReady, isAuthenticated, router]);

  return (
    <main className="main-container" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <p>Preparing SimpleHome dashboard...</p>
    </main>
  );
}
