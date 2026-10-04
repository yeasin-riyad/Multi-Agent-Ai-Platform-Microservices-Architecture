import { Code2, PanelRightClose } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";

const Artifact = () => {
  const { artifacts } = useSelector((state) => state.message);
  const [collapsed, setCollapsed] = useState(false);

  if (artifacts.length === 0) return null; // React components should return null instead of undefined when rendering nothing

  return (
    <motion.div 
      initial={{ width: "250px" }} 
      animate={{ width: collapsed ? "60px" : "250px" }} // Smoothly animate the width when collapsing
      transition={{ duration: 0.2 }}
    >
      <div className="hidden lg:flex h-full border border-white/[0.06] flex-col overflow-hidden shrink-0 w-full">
        {!collapsed ? (
          <div className="flex flex-col h-full bg-[#0d0f14]">
            <div className="h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
              <button
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 
                hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                <PanelRightClose size={16} />
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                  <Code2 className="text-indigo-400" size={12} />
                </div>

                <div className="text-[13px] font-medium text-slate-200 truncate">
                  {artifacts[0]?.title}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center pt-4 h-full bg-[#0d0f14]">
            {/* What shows up when collapsed (e.g., just the toggle button turned around) */}
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 
              hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <PanelRightClose size={16} className="rotate-180" /> {/* Flips the arrow direction */}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Artifact;
