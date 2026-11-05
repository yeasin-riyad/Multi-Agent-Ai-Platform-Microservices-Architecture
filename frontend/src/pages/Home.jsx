
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase.js";
import api from "../../utils/axios.js";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

import ChatArea from "../components/ChatArea.jsx";
import Artifact from "../components/Artifact.jsx";
import Sidebar from "../components/Sidebar.jsx";

import { HiOutlineSparkles } from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (token) => {
    const { data } = await api.post("/api/auth/login", { token });
    dispatch(setUserData(data));
  };

  const googleLogin = async () => {
    try {
      setIsLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      await handleLogin(token);

    } catch (error) {
      console.error("Login Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen min-w-0 flex bg-[#0d0f14] text-white overflow-hidden">

      <Sidebar />
      <ChatArea />
      <Artifact />

      {/* Login Modal */}
      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
                Welcome to AgentixAI
              </h2>

              <p className="text-[13px] text-slate-500">
                Please login to continue using the app.
              </p>
            </div>

            <button
              onClick={googleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3
              py-[11px] rounded-xl text-sm font-medium text-white
              bg-gradient-to-br from-indigo-500 to-violet-700
              hover:from-indigo-400 hover:to-violet-600
              border border-indigo-500/30
              shadow-lg shadow-indigo-500/20
              transition-all duration-150 cursor-pointer
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FcGoogle size={17} />
              {isLoading ? "Signing in..." : "Continue With Google"}
            </button>

          </div>
        </div>
      )}

      {/* Full Screen Loading */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center
        bg-[#0d0f14]/95 backdrop-blur-xl">

          <div className="flex flex-col items-center gap-6">

            {/* Animated Logo */}
            <div className="relative flex items-center justify-center">

              <div className="absolute w-24 h-24 rounded-full
              border border-indigo-500/20 animate-ping" />

              <div className="w-20 h-20 rounded-2xl
              bg-gradient-to-br from-indigo-500 to-violet-700
              flex items-center justify-center
              shadow-xl shadow-indigo-500/30">

                <HiOutlineSparkles size={38} className="text-white" />

              </div>

            </div>

            {/* Spinner */}
            <ImSpinner8
              size={27}
              className="text-indigo-400 animate-spin"
            />

            {/* Loading Text */}
            <div className="text-center space-y-2">

              <h2 className="text-lg font-semibold text-white tracking-wide">
                Welcome to AgentixAI
              </h2>

              <p className="text-sm text-slate-400">
                Securing your account...
              </p>

              <p className="text-xs text-slate-600">
                Please wait while we prepare your workspace.
              </p>

            </div>

            {/* Loading Indicator */}
            <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r
              from-indigo-500 to-violet-500 rounded-full
              animate-pulse" />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
