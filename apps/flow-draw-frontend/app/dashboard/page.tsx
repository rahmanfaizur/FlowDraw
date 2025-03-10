"use client"

import { Dashboard } from "@/components/Dashboard";
import { useState } from "react";

export default function DashboardPage() {
    const [roomId, setRoomId] = useState<string | null>(null)
    return (
        <div className={`bg-my-custom text-white w-screen h-screen`}>
            <Dashboard roomId={roomId} setRoomId={setRoomId}/>
        </div>
    )
}
