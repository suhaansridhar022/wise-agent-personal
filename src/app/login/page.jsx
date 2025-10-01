"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { setEmail } = useUser();
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setEmail(inputEmail); // store email globally
    //router.push("/chat"); // navigate to chat page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="border border-gray-300 rounded-lg p-8 shadow-lg w-96 bg-white flex flex-col items-center justify-center">
        
        <input
          type="email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-gray-300 p-2 rounded w-full h-10 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="relative w-full mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter your password"
            className="border border-gray-300 p-2 rounded w-full h-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded h-10 flex items-center justify-center hover:bg-blue-600 transition-colors font-medium"
        >
          Login
        </button>
      </div>
    </div>
  );
}