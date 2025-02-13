"use client"
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  //TODO: Ideally u should use react hook forms here!
  const [roomId, setRoomId] = useState("");
  const router = useRouter();


  return (
    <div className={"flex h-screen w-screen justify-center items-center"}>
     <div>
     <input type="text" value={roomId} onChange={(e) => {
        setRoomId(e.target.value)
      }} placeholder="Room Id" />
      <button onClick={() => {
        router.push(`/room/${roomId}`)
      }}>Join Room!</button>
     </div>
    </div>
  );
}
