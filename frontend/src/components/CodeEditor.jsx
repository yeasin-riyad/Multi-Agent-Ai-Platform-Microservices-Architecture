import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { highlightCode } from "../../utils/syntaxHighlighter.js";

const CodeEditor = ({ currentFile }) => {
  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-[13px] text-[#5a5a5a] font-mono bg-[#1e1e1e]">
        No File Selected
      </div>
    );
  }

  // Tokenize language tokens cleanly into an HTML string layout
  const renderedTokens = useMemo(() => {
    return highlightCode(currentFile.content, currentFile.name);
  }, [currentFile.content, currentFile.name]);

  // Dynamically calculate individual lines to keep gutters identical to code blocks
  const lineNumbers = useMemo(() => {
    const lines = (currentFile.content || "").split("\n");
    return Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);
  }, [currentFile.content]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
      {/* Breadcrumbs Tab Tracking */}
      <div className="h-7 px-4 bg-[#1e1e1e] border-b border-[#252526] flex items-center gap-1.5 text-[11px] text-[#858585] shrink-0 font-mono select-none">
        <span>src</span>
        <ChevronRight size={10} className="text-[#5a5a5a]" />
        <span className="text-[#d4d4d4]">{currentFile.name}</span>
      </div>

      {/* Editor Viewport Scroll Panel Wrapper */}
      <div className="flex-1 flex overflow-auto text-[13px] font-mono leading-6 select-text selection:bg-[#264f78] custom-scrollbar">
        
        {/* VS Code Line Gutter Panel */}
        <div className="w-12 flex flex-col text-right pr-3 pl-2 text-[#858585] bg-[#1e1e1e] select-none border-r border-[#2d2d2d] pt-4 shrink-0 font-mono">
          {lineNumbers.map((num) => (
            <div key={num} className="h-6 flex items-center justify-end text-[12px]">
              {num}
            </div>
          ))}
        </div>

        {/* Highlighted Script Target Viewport Area */}
        <pre 
          className="flex-1 p-0 pt-4 pl-4 m-0 overflow-visible whitespace-pre text-[#d4d4d4] bg-[#1e1e1e] font-mono leading-6 tab-size-4"
          style={{ tabSize: 4, MozTabSize: 4 }}
          dangerouslySetInnerHTML={{ __html: renderedTokens || "// Empty File" }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
