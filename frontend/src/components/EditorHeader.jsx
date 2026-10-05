import { Code2, PanelRightClose, Copy, Check, Eye, Terminal } from "lucide-react";

const EditorHeader = ({ 
  artifactTitle, 
  viewMode, 
  setViewMode, 
  onToggleCollapse, 
  onCopy, 
  copied, 
  hasFile 
}) => {
  return (
    <div className="h-12 px-3 bg-[#252526] border-b border-[#2d2d2d] flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="flex items-center justify-center w-6 h-6 rounded text-[#858585] hover:text-[#e1e1e1] hover:bg-[#37373d] transition-colors bg-transparent border-none cursor-pointer"
          onClick={onToggleCollapse}
          title="Collapse Panel"
        >
          <PanelRightClose size={15} />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-[#2f3239] border border-[#444] shrink-0">
            <Code2 className="text-[#007acc]" size={12} />
          </div>
          <div className="text-[12px] font-medium text-[#e1e1e1] truncate font-mono">
            {artifactTitle}
          </div>
        </div>
      </div>

      {/* ACTION TOGGLE CONTROLS */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setViewMode("code")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border-none ${
            viewMode === "code"
              ? "bg-[#007acc] text-white"
              : "bg-[#37373d] text-[#cccccc] hover:bg-[#4e4e54]"
          }`}
        >
          <Terminal size={13} />
          Code
        </button>

        <button
          onClick={() => setViewMode("preview")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border-none ${
            viewMode === "preview"
              ? "bg-[#007acc] text-white"
              : "bg-[#37373d] text-[#cccccc] hover:bg-[#4e4e54]"
          }`}
        >
          <Eye size={13} />
          Preview
        </button>

        {viewMode === "code" && (
          <button
            onClick={onCopy}
            disabled={!hasFile}
            className="flex items-center justify-center w-6 h-6 rounded bg-[#37373d] text-[#cccccc] hover:bg-[#4e4e54] transition-colors cursor-pointer border-none disabled:opacity-40"
            title="Copy File Content"
          >
            {copied ? <Check size={13} className="text-[#4ec9b0]" /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorHeader;
