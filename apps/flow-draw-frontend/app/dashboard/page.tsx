"use client"

import { Dashboard } from "@/components/Dashboard";
import { useState } from "react";

export default function DashboardPage() {
    const [roomId, setRoomId] = useState<string | null>(null)
    return <Dashboard roomId={roomId} setRoomId={setRoomId}/>;
}
