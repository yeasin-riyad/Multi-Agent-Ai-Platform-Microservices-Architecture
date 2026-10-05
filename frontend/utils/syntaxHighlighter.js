export const highlightCode = (code = "", fileName = "") => {
  if (!code) return "";
  
  const ext = fileName.split(".").pop()?.toLowerCase();
  const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // If not a supported language extension, return clean escaped code strings
  if (!["html", "css", "js", "jsx", "ts", "tsx", "json"].includes(ext)) {
    return escapeHtml(code);
  }

  // 1. JSON Engine Patch
  if (ext === "json") {
    const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?)|(\b(true|false|null)\b)|(-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
    const highlighted = code.replace(jsonRegex, (match) => {
      let cls = "text-[#b5cea8]"; // Numbers default
      if (/^"/.test(match)) {
        cls = /:\$/.test(match) ? "text-[#9cdcfe]" : "text-[#ce9178]";
      } else if (/true|false|null/.test(match)) {
        cls = "text-[#569cd6]";
      }
      return `<span class="cls">{escapeHtml(match)}</span>`;
    });
    return highlighted;
  }

  // 2. Multi-Language Highlighting Definitions Matrix
  let rules = [];
  if (ext === "html") {
    rules = [
      { regex: /(<!--[\s\S]*?-->)/g, token: "text-[#6a9955] italic" },
      { regex: /(<\/?[a-zA-Z0-9:-]+)/g, token: "text-[#569cd6]" },
      { regex: /(\s[a-zA-Z0-9:-]+=)/g, token: "text-[#9cdcfe]" },
      { regex: /("[^"]*")/g, token: "text-[#ce9178]" },
    ];
  } else if (ext === "css") {
    rules = [
      { regex: /(\/\*[\s\S]*?\*\/)/g, token: "text-[#6a9955] italic" },
      { regex: /([a-zA-Z-]+\s*:)/g, token: "text-[#9cdcfe]" },
      { regex: /(#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)(?=\s*\{|,)/g, token: "text-[#d7ba7d]" },
      { regex: /(:[^;}\n]+)/g, token: "text-[#ce9178]" },
    ];
  } else {
    // Optimized execution order for JS, JSX, TS, TSX
    rules = [
      // Comments first to avoid treating comment contents as keywords
      { regex: /(\/\*[\s\S]*?\*\/|\/\/.*)/g, token: "text-[#6a9955] italic" },
      // Strict matching for single, double, and template strings
      { regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, token: "text-[#ce9178]" },
      // Reserved JS Engine Language Keywords
      { regex: /\b(const|let|var|function|return|import|export|from|default|if|else|for|while|switch|case|break|class|extends|new|true|false|null|async|await)\b/g, token: "text-[#569cd6]" },
      // Window Global Interfaces / Objects
      { regex: /\b(console|window|document|process|Object|Array|String|Function|Promise)\b/g, token: "text-[#4ec9b0]" },
      // Function invocations (Method triggers)
      { regex: /\b([a-zA-Z0-9_]+)(?=\s*\()/g, token: "text-[#dcdcaa]" },
      // Standalone numerical assignments
      { regex: /\b(-?\d+(?:\.\d*)?)\b/g, token: "text-[#b5cea8]" },
    ];
  }

  let highlighted = escapeHtml(code);
  
  // Apply marker tags across token positions smoothly
  rules.forEach(({ regex, token }) => {
    highlighted = highlighted.replace(regex, (match) => {
      // Guard to prevent nested rules breaking previously injected marker spans
      if (match.includes("__TOKEN_START__")) return match;
      return `__TOKEN_START__${token}__TOKEN_SPLIT__${match}__TOKEN_END__`;
    });
  });

  // Rehydrate the markup boundaries safely back into target HTML components
  return highlighted
    .replace(/__TOKEN_START__(.*?)__TOKEN_SPLIT__/g, '<span class="\$1">')
    .replace(/__TOKEN_END__/g, "</span>");
};
