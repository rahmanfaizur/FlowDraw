import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export const signup = async (email: string, password: string, username: string) => {
    try {
        if (!HTTP_BACKEND) {
            throw new Error("Backend URL is not configured");
        }

        const response = await axios.post(`${HTTP_BACKEND}/signup`, {
            email,
            name: username,  // This matches the backend schema
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data) {
            return response.data;
        } else {
            throw new Error("No data received from server");
        }
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error("Signup error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: errorMessage
            });
            throw new Error(errorMessage);
        }
        console.error("Non-Axios error:", error);
        throw new Error("An unexpected error occurred during signup");
    }
};

export const signin = async (email: string, password: string) => {
    try {
        if (!HTTP_BACKEND) {
            throw new Error("Backend URL is not configured");
        }

        const response = await axios.post(`${HTTP_BACKEND}/signin`, {
            email,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data) {
            localStorage.setItem("token", response.data.token);
        } else {
            throw new Error("No data received from server");
        }
    } catch (error: any) {
        throw new Error("An unexpected error occurred during signin");
    }
};
