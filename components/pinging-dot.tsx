import React from "react";

const PingingDot = () => {
  return (
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
      <span className="relative inline-flex h-3 w-3 rounded-full bg-purple-500"></span>
    </span>
  );
};

export default PingingDot;
