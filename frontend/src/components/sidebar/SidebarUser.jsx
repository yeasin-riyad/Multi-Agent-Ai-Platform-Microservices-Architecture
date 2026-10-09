import {
  Coins,
  LogOut,
  User,
} from "lucide-react";

const SidebarUser = ({
  userData,
  imageError,
  onImageError,
  onLogout,
}) => {
  return (
    <>
      {/* Divider */}
      <div className="mx-2.5 h-px bg-white/[0.06] shrink-0" />

      {/* User */}
      <div
        className="
          px-2.5
          sm:px-3.5
          py-3
          sm:py-3.5
          shrink-0
        "
      >
        {userData ? (
          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-2.5
              rounded-xl
              px-2
              sm:px-3
              py-2
              sm:py-2.5
              hover:bg-white/[0.05]
              transition-colors
              duration-150
            "
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {userData?.avatar && !imageError ? (
                <img
                  className="
                    w-8
                    h-8
                    sm:w-9
                    sm:h-9
                    rounded-[9px]
                    sm:rounded-[10px]
                    object-cover
                    border-2
                    border-indigo-500/25
                  "
                  src={userData.avatar}
                  alt="User avatar"
                  onError={onImageError}
                />
              ) : (
                <div
                  className="
                    w-8
                    h-8
                    sm:w-9
                    sm:h-9
                    rounded-[9px]
                    sm:rounded-[10px]
                    bg-white/[0.06]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <User
                    size={15}
                    className="text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <p
                className="
                  text-[12.5px]
                  sm:text-[13.5px]
                  font-semibold
                  text-slate-100
                  truncate
                "
              >
                {userData?.name || "User"}
              </p>

              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-px">
                Free Plan
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-0.5 sm:gap-1 shrink-0">
              {/* Credits */}
              <button
                type="button"
                aria-label="Credits"
                className="
                  flex
                  items-center
                  justify-center
                  w-7
                  h-7
                  rounded-[7px]
                  border-none
                  bg-transparent
                  text-yellow-600
                  cursor-pointer
                  hover:bg-white/[0.08]
                  hover:text-slate-400
                  transition-all
                  duration-150
                "
              >
                <Coins size={16} />
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                className="
                  flex
                  items-center
                  justify-center
                  w-7
                  h-7
                  rounded-[7px]
                  border-none
                  bg-transparent
                  text-yellow-600
                  cursor-pointer
                  hover:bg-white/[0.08]
                  hover:text-slate-400
                  transition-all
                  duration-150
                "
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              text-[13px]
              sm:text-sm
              font-medium
              text-slate-200
              bg-white/[0.05]
              border
              border-white/[0.08]
              rounded-xl
              py-2.5
              sm:py-[11px]
              cursor-pointer
              hover:bg-white/[0.08]
              transition-colors
              duration-150
            "
          >
            Login
          </button>
        )}
      </div>
    </>
  );
};

export default SidebarUser;