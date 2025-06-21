import React from "react";

const LinkWithIcon: React.FC<{ url: string; className?: string }> = ({ url, className }) => {
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <img
        src={`https://logo.clearbit.com/${domain}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        }}
        alt={`${domain} icon`}
        className="w-6 h-6 rounded"
      />
     
    </div>
  );
};

export default LinkWithIcon;