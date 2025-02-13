"use client"
export function AuthPage({isSignin} : {
    isSignin: boolean
}) {
    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-2 m-2 bg-white rounded">
            <div>
            <input type="text" name="" id="" placeholder="Email" />
            </div>
            <div>
            <input type="password" name="" id="" placeholder="Password" />
            </div>
            <button onClick={() => {

            }}>{isSignin ? "Sign in" : "Sign up"}</button>
        </div>
    </div>
}