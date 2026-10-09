const SidebarOverlay = ({
  open,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Close sidebar"
      onClick={onClose}
      className="
        fixed
        inset-0
        z-40
        bg-black/50
        backdrop-blur-[2px]
        lg:hidden
        cursor-default
        border-none
      "
    />
  );
};

export default SidebarOverlay;