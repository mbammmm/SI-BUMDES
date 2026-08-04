"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    function update() {
      setOnline(navigator.onLine);
    }

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg shadow-sm">
      <WifiOff size={18} />
      <span className="text-sm font-semibold">Offline</span>
    </div>
  );
}
