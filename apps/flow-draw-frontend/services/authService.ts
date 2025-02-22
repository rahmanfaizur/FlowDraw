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

export const getRoomId = async (requestBody: string) => {
    try {
        const response = await axios.post(`${HTTP_BACKEND}/room`, { name: requestBody }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${localStorage.getItem("token")}` // Include the token for authentication
            }
        });
        console.log("API Response:", response.data); // Log the API response
        if (response.data) {
            return response.data.roomId; // Assuming the response contains a roomId field
        } else {
            throw new Error("No data received from server");
        }
    } catch (error) {
        console.error("Error fetching room ID:", error); // Log any errors
        throw error; // Rethrow the error for further handling if needed
    }
};

export const getAllRooms = async () => {
    try {
        const response = await axios.get(`${HTTP_BACKEND}/allrooms`, {
            headers: {
                'Authorization': `${localStorage.getItem("token")}` // Include the token for authentication
            }
        });
        return response.data.rooms; // Assuming the response contains a rooms field
    } catch (error) {
        console.error("Error fetching all rooms:", error);
        throw error; // Rethrow the error for further handling if needed
    }
};

export const getRoomBySlug = async (slug: string) => {
    try {
        const response = await axios.get(`${HTTP_BACKEND}/room/${slug}`, {
            headers: {
                'Authorization': `${localStorage.getItem("token")}` // Include the token for authentication
            }
        });
        return response.data.room; // Assuming the response contains a room object
    } catch (error) {
        console.error("Error fetching room by slug:", error);
        throw error; // Rethrow the error for further handling if needed
    }
};

export const deleteRoom = async (roomId: string) => {
    try {
        const response = await axios.delete(`${HTTP_BACKEND}/room/${roomId}`, {
            headers: {
                'Authorization': `${localStorage.getItem("token")}` // Include the token for authentication
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting room:", error);
        throw error; // Rethrow the error for further handling if needed
    }
};

export const getSlug = async (roomId: string) => {
    try {
        const response = await axios.get(`${HTTP_BACKEND}/slug/${roomId}`);
        // console.log("API Response:", response.data); // Log the API response
        return response.data.slug;
    } catch (error) {
        console.error("Error fetching slug:", error);
        throw error; // Rethrow the error for further handling if needed
    }
};