import { FileCode } from "lucide-react";

const FileExplorer = ({ fileList, selectedFileIndex, onSelectFile }) => {
  return (
    <div className="w-[130px] bg-[#252526] border-r border-[#2d2d2d] p-2 flex flex-col gap-0.5 overflow-y-auto shrink-0 select-none">
      <div className="text-[10px] font-bold text-[#858585] uppercase tracking-wider px-2 py-1 mb-1 font-mono">
        Explorer
      </div>
      {fileList.map((file, index) => (
        <button
          key={file.name || index}
          onClick={() => onSelectFile(index)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] font-mono text-left border-none cursor-pointer transition-all ${
            selectedFileIndex === index
              ? "bg-[#37373d] text-white font-semibold shadow-inner"
              : "bg-transparent text-[#969696] hover:bg-[#2a2d2e] hover:text-[#e1e1e1]"
          }`}
        >
          <FileCode
            size={13}
            className={selectedFileIndex === index ? "text-[#007acc]" : "text-[#858585]"}
          />
          <span className="truncate">{file.name}</span>
        </button>
      ))}
    </div>
  );
};

export default FileExplorer;
