import React from "react";

interface LinkValidatorProps {
  url: string;
  children: (isValid: boolean, message: string) => React.ReactNode;
}

const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

export function validateUrl(url: string): { isValid: boolean; message: string } {
  if (!url || url.trim() === "") {
    return { isValid: false, message: "URL is required" };
  }
  if (!/^https?:\/\//i.test(url)) {
    return { isValid: false, message: "URL must start with http:// or https://" };
  }
  if (!urlPattern.test(url)) {
    return { isValid: false, message: "Invalid URL format" };
  }
  return { isValid: true, message: "" };
}

const LinkValidator: React.FC<LinkValidatorProps> = ({ url, children }) => {
  const { isValid, message } = validateUrl(url);
  return <>{children(isValid, message)}</>;
};

export default LinkValidator;