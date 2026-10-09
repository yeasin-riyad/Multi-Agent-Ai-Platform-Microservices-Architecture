import { PanelRight } from "lucide-react";

const MobileSidebarTrigger = ({
  open,
  onOpen,
}) => {
  if (open) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open sidebar"
      className="
        fixed
        left-3
        top-3
        z-30

        flex
        lg:hidden

        items-center
        justify-center

        w-10
        h-10

        rounded-xl

        bg-[#0d0f14]
        border
        border-white/[0.08]

        text-slate-400

        hover:text-white
        hover:bg-white/[0.08]

        shadow-lg

        transition-all
        duration-150
      "
    >
      <PanelRight size={18} />
    </button>
  );
};

export default MobileSidebarTrigger;