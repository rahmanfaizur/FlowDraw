"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/app/icons/GoogleIcon";
import Input from "../components/Input";
import PasswordInput from "./PasswordInput";
import { Button, ButtonSize, ButtonVariant } from "./Button";
import { signup, signin } from "../services/authService";
import axios from "axios";
import Image from "next/image";
import { useWindowSize } from "@uidotdev/usehooks";
// import { SignalZero } from "lucide-react";
// import Image from "next/image";

export function AuthPage({isSignin} : {
    isSignin: boolean
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const size = useWindowSize();

    const handleSubmit = async () => {
        try {
            setError("");
            setIsLoading(true);

            const email = emailRef.current?.value;
            const password = passwordRef.current?.value;

            if (!email || !password) {
                throw new Error("Please fill in all fields");
            }

            if (!isSignin) {
                const username = usernameRef.current?.value;
                if (!username) {
                    throw new Error("Please enter a username");
                }

                await signup(email, password, username);
                console.log("Signup successful");
                router.push('/signin');  // Navigate to signin after signup
            } else {
                await signin(email, password);
                console.log("Signin successful");
                router.push('/dashboard');  // Navigate to dashboard after signin
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError("");
            setIsGoogleLoading(true);

            const response = await axios.get('/api/auth/google');
            
            // Handle Google OAuth redirect URL
            window.location.href = response.data.url;

        } catch (err) {
            console.error(err);
            setError("Failed to initialize Google sign in");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const title = isSignin ? "Welcome Back to FlowDraw" : "Create Your FlowDraw Account";
    const subtitle = isSignin 
      ? "Access your creative workspace with your email and password"
      : "Join FlowDraw to visualize your ideas and collaborate effortlessly";
    const buttonText = isSignin ? "Sign In" : "Sign Up";
    const googleButtonText = isSignin ? "Sign In With Google" : "Sign Up With Google";
    const footerText = isSignin 
      ? "Don't have an account?" 
      : "Already have an account?";
    const footerLinkText = isSignin ? "Sign Up" : "Sign In";
    const footerLinkHref = isSignin ? "/signup" : "/signin";

    return (
        <div className="relative w-screen h-screen">
            <Image
                src="https://res.cloudinary.com/dvsbdjslb/image/upload/v1741892988/35ab4225-1.jpg"
                width={size.width ?? "1920"}
                height={size.height ?? "1080"}
                alt=""
                className="w-full h-full object-cover"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] px-8 flex gap-0 flex-col md:flex-row">
                <div className="hidden md:flex flex-1 border-l-4 border-y-4 rounded-l-xl border-white bg-transparent">
                    <div className="p-12 text-white flex flex-col justify-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 font-sans">FlowDraw: Visualize Your Ideas</h1>
                        <p className="text-lg font-sans">Transform your concepts into stunning visuals. Collaborate in real-time and share your creativity with the world.</p>
                    </div>
                </div>
                <div className="flex-1 bg-white border-r-4 rounded-r-xl flex flex-col items-center justify-center">
                    <div className="w-full max-w-md px-8">
                        <h2 className="text-4xl font-bold mb-2 text-center font-sans">{title}</h2>
                        <p className="text-gray-600 text-center mb-8 font-sans">{subtitle}</p>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {!isSignin && (
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <Input ref={usernameRef} placeholder="Enter your username" className="w-full p-0" />
                                </div>
                            )}
                            
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <Input ref={emailRef} placeholder="Enter your email" className="w-full p-0" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <PasswordInput ref={passwordRef} placeholder="Enter your password" className="w-full" />
                            </div>

                            {isSignin && (
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                                        <label className="ml-2 text-sm text-gray-600">Remember me</label>
                                    </div>
                                    <a href="#" className="text-sm text-gray-600 hover:underline">Forgot Password</a>
                                </div>
                            )}

                            <Button 
                                className="font-bold w-full relative" 
                                size={ButtonSize.LONG} 
                                variant={ButtonVariant.BLACK}
                                onClick={handleSubmit}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Coloring In...
                                    </div>
                                ) : buttonText}
                            </Button>
                            
                            <Button 
                                icon={<GoogleIcon size="lg"/>}
                                className="font-bold w-full mt-4 relative" 
                                size={ButtonSize.LONG} 
                                variant={ButtonVariant.WHITE}
                                onClick={handleGoogleSignIn}
                            >
                                {isGoogleLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Authenticating...
                                    </div>
                                ) : googleButtonText}
                            </Button>
                        </div>

                        <div className="flex justify-center mt-8 text-sm text-gray-600 font-sans">
                            <p>{footerText}</p>
                            <a href={footerLinkHref} className="text-black font-semibold hover:underline ml-1">{footerLinkText}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );      
}
