// apps/flow-draw-frontend/components/Navbar.tsx
import React from "react";
import { Button, ButtonVariant } from "./Button";
import { useRouter } from "next/navigation";

function Navbar() {
    const router = useRouter();

    function logoutUser() {
        localStorage.removeItem("token");
        router.push("/signin");
    }

    return (
        <div className="flex justify-between items-center mb-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <h1 className="text-4xl font-bold text-white">Flow Draw</h1>
            <Button onClick={logoutUser} variant={ButtonVariant.RED}>Logout</Button>
        </div>
    );
}

export default Navbar;