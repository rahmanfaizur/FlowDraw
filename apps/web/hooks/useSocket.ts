import { useEffect, useState } from "react";
import { WS_URL } from "../app/room/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        // const ws = new WebSocket(WS_URL);
        const ws = new WebSocket('ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NTAzMGI1OC1jZTUxLTRjMTAtYjUzNS1jYTBmMWY4NTJiMmMiLCJlbWFpbCI6ImphbWVzQGdtYWlsLmNvbSIsImlhdCI6MTczOTM0MDEzOH0.QqSYSE9hqUit8qcyjlsWeV7lgXugcHlo9CEBDJaWgCQ');
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);
    return {
        socket,
        loading
    }
}