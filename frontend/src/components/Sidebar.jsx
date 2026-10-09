import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getConversations } from "../features/getConversation";
import {
  addConversation,
  setConversations,
  setSelectedConversations,
} from "../redux/conversationSlice";

import { createConversation } from "../features/createConversation";
import logOut from "../features/logOut";
import { setUserData } from "../redux/userSlice";

import CollapsedSidebar from "./sidebar/CollapsedSidebar";
import MobileSidebarTrigger from "./sidebar/MobileSidebarTrigger";
import SidebarOverlay from "./sidebar/SidebarOverlay";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNewChat from "./sidebar/SidebarNewChat";
import SidebarConversations from "./sidebar/SidebarConversations";
import SidebarUser from "./sidebar/SidebarUser";
import { deleteConversation } from "../features/deleteConversation";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const dispatch = useDispatch();

  const {
    conversations,
    selectedConversation,
    deleteConversation:deleteConversationAction
  } = useSelector((state) => state.conversation);

  const { userData } = useSelector((state) => state.user);

  const handleDeleteConversation = async (conversationId) => {
  try {
    await deleteConversation(conversationId);

    dispatch(
      deleteConversationAction(conversationId),
    );
  } catch (error) {
    console.error(
      "Failed to delete conversation:",
      error,
    );
  }
};

  /*
   * =====================================================
   * LOAD CONVERSATIONS
   * =====================================================
   */

  useEffect(() => {
    const getConv = async () => {
      try {
        const data = await getConversations();

        dispatch(setConversations(data));
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error,
        );
      }
    };

    getConv();
  }, [userData?._id, dispatch]);

  /*
   * =====================================================
   * CREATE CONVERSATION
   * =====================================================
   */

  const handleCreateConversation = async () => {
    try {
      const data = await createConversation();

      dispatch(addConversation(data));

      setMobileOpen(false);
    } catch (error) {
      console.error(
        "Failed to create conversation:",
        error,
      );
    }
  };

  /*
   * =====================================================
   * SELECT CONVERSATION
   * =====================================================
   */

  const handleSelectConversation = (conversation) => {
    dispatch(setSelectedConversations(conversation));

    setMobileOpen(false);
  };

  /*
   * =====================================================
   * NEW CHAT
   * =====================================================
   */

  const handleNewChat = () => {
    dispatch(setSelectedConversations(null));

    setMobileOpen(false);
  };

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout = () => {
    logOut();

    dispatch(setUserData(null));

    setMobileOpen(false);
  };

  /*
   * =====================================================
   * COLLAPSED DESKTOP SIDEBAR
   * =====================================================
   */

  if (collapsed) {
    return (
      <CollapsedSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        userData={userData}
        imageError={imageError}
        onImageError={() => setImageError(true)}
        onExpand={() => setCollapsed(false)}
        onCreateConversation={
          handleCreateConversation
        }
        onSelectConversation={
          handleSelectConversation
        }
      />
    );
  }

  /*
   * =====================================================
   * MAIN SIDEBAR
   * =====================================================
   */

  return (
    <>
      <SidebarOverlay
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <aside
        className={`
          fixed
          lg:static
          inset-y-0
          left-0
          z-50
          h-screen
          shrink-0
          bg-[#0d0f14]
          border-r
          border-white/[0.06]

          w-[85vw]
          max-w-[300px]

          sm:w-[280px]
          md:w-[300px]

          lg:w-[270px]
          lg:max-w-none

          transform
          transition-transform
          duration-200
          ease-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full min-h-0">
          <SidebarHeader
            onCollapse={() => setCollapsed(true)}
            onNewChat={handleNewChat}
            onClose={() => setMobileOpen(false)}
          />

          <SidebarNewChat
            onNewChat={handleNewChat}
          />

          <SidebarConversations
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={
              handleSelectConversation
            }
            onDeleteConversation={handleDeleteConversation}
          />

          <SidebarUser
            userData={userData}
            imageError={imageError}
            onImageError={() => setImageError(true)}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      <MobileSidebarTrigger
        open={mobileOpen}
        onOpen={() => setMobileOpen(true)}
      />
    </>
  );
};

export default Sidebar;