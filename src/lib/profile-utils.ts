import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaGithub, FaLink, FaRobot, FaCode, FaMicrochip, FaLightbulb } from 'react-icons/fa';
import { SiTiktok, SiDiscord, SiTelegram, SiWhatsapp, SiSnapchat, SiPinterest, SiReddit, SiTwitch, SiSpotify, SiApple, SiGoogle, SiAmazon, SiNetflix, SiOpenai } from 'react-icons/si';

export function getSocialIcon(url: string, size: number = 24): React.ReactElement {
  const urlLower = url.toLowerCase();
  
  // AI/Chat platforms (check these first for better specificity)
  if (urlLower.includes('deepseek.com') || urlLower.includes('deepseek')) {
    return React.createElement(FaMicrochip, { size, className: "text-blue-600" });
  }
  if (urlLower.includes('openai.com') || urlLower.includes('chatgpt') || urlLower.includes('openai')) {
    return React.createElement(SiOpenai, { size, className: "text-green-600" });
  }
  if (urlLower.includes('claude') || urlLower.includes('anthropic')) {
    return React.createElement(FaRobot, { size, className: "text-orange-500" });
  }
  if (urlLower.includes('gemini') || urlLower.includes('bard')) {
    return React.createElement(FaLightbulb, { size, className: "text-purple-500" });
  }
  
  // Social media platforms
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return React.createElement(FaFacebook, { size, className: "text-blue-600" });
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return React.createElement(FaTwitter, { size, className: "text-blue-400" });
  }
  if (urlLower.includes('instagram.com')) {
    return React.createElement(FaInstagram, { size, className: "text-pink-500" });
  }
  if (urlLower.includes('linkedin.com')) {
    return React.createElement(FaLinkedin, { size, className: "text-blue-700" });
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return React.createElement(FaYoutube, { size, className: "text-red-600" });
  }
  if (urlLower.includes('tiktok.com')) {
    return React.createElement(SiTiktok, { size, className: "text-black" });
  }
  if (urlLower.includes('github.com')) {
    return React.createElement(FaGithub, { size, className: "text-gray-800" });
  }
  if (urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
    return React.createElement(SiDiscord, { size, className: "text-indigo-600" });
  }
  if (urlLower.includes('t.me') || urlLower.includes('telegram.org')) {
    return React.createElement(SiTelegram, { size, className: "text-blue-500" });
  }
  if (urlLower.includes('wa.me') || urlLower.includes('whatsapp.com')) {
    return React.createElement(SiWhatsapp, { size, className: "text-green-500" });
  }
  if (urlLower.includes('snapchat.com')) {
    return React.createElement(SiSnapchat, { size, className: "text-yellow-400" });
  }
  if (urlLower.includes('pinterest.com')) {
    return React.createElement(SiPinterest, { size, className: "text-red-500" });
  }
  if (urlLower.includes('reddit.com')) {
    return React.createElement(SiReddit, { size, className: "text-orange-500" });
  }
  if (urlLower.includes('twitch.tv')) {
    return React.createElement(SiTwitch, { size, className: "text-purple-600" });
  }
  if (urlLower.includes('spotify.com')) {
    return React.createElement(SiSpotify, { size, className: "text-green-500" });
  }
  
  // Tech platforms
  if (urlLower.includes('apple.com')) {
    return React.createElement(SiApple, { size, className: "text-gray-800" });
  }
  if (urlLower.includes('google.com') || urlLower.includes('gmail.com') || urlLower.includes('goog')) {
    return React.createElement(SiGoogle, { size, className: "text-blue-500" });
  }
  if (urlLower.includes('microsoft.com')) {
    return React.createElement(SiGoogle, { size, className: "text-blue-600" });
  }
  if (urlLower.includes('amazon.com')) {
    return React.createElement(SiAmazon, { size, className: "text-orange-500" });
  }
  if (urlLower.includes('netflix.com')) {
    return React.createElement(SiNetflix, { size, className: "text-red-600" });
  }
  
  // Development/Coding platforms
  if (urlLower.includes('stackoverflow.com')) {
    return React.createElement(FaCode, { size, className: "text-orange-500" });
  }
  if (urlLower.includes('codepen.io')) {
    return React.createElement(FaCode, { size, className: "text-black" });
  }
  if (urlLower.includes('jsfiddle.net')) {
    return React.createElement(FaCode, { size, className: "text-blue-500" });
  }
  
  // Default link icon
  return React.createElement(FaLink, { size, className: "text-gray-500" });
}

export function detectDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    return 'Android';
  }
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'iOS';
  }
  if (/windows/.test(userAgent)) {
    return 'Windows';
  }
  if (/macintosh|mac os x/.test(userAgent)) {
    return 'macOS';
  }
  if (/linux/.test(userAgent)) {
    return 'Linux';
  }
  
  return 'Unknown';
}

export function detectBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'Chrome';
  }
  if (userAgent.includes('firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('edg')) {
    return 'Edge';
  }
  if (userAgent.includes('opera') || userAgent.includes('opr')) {
    return 'Opera';
  }
  
  return 'Unknown';
}