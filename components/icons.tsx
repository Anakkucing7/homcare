import type { SVGProps } from "react";

type IconName = "heart" | "home" | "shield" | "clock" | "calendar" | "arrow" | "arrowRight" | "chevronDown" | "nurse" | "phone" | "close" | "pin" | "check" | "syringe" | "droplet" | "tube" | "bandage" | "eye" | "eyeOff";

const paths: Record<IconName, React.ReactNode> = {
  heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/><path d="M3 12h5l2-3 3 7 2-4h6"/></>,
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
  arrowRight: <><path d="M4 12h15M13 5l7 7-7 7"/></>,
  chevronDown: <path d="m6 9 6 6 6-6"/>,
  nurse: <><path d="M8 5h8l1 4H7l1-4Z"/><path d="M9 5a3 3 0 0 1 6 0M12 6v2M10 15v-1a2 2 0 1 1 4 0v1"/><path d="M5 21a7 7 0 0 1 14 0M7 17l-2 4M17 17l2 4"/><path d="M4 11c0 3 2 5 5 5m11-5c0 3-2 5-5 5"/></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6 6l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.6 1.9Z"/>,
  close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  syringe: <><path d="m18 2 4 4M17 7l-9 9M14 4l6 6M5 18l-3 3M9 14l4 4M3 16l5 5M4 17l8-8"/><path d="m15 3 6 6"/></>,
  droplet: <><path d="M12 2.5S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5Z"/><path d="M9 16a3 3 0 0 0 3 3"/></>,
  tube: <><path d="M8 3h8M10 3v11a4 4 0 0 0 8 0V3M10 10h8"/><path d="M4 5h2v14H4zM3 19h4"/></>,
  bandage: <><path d="m4 8 4-4a3 3 0 0 1 4 0l8 8a3 3 0 0 1 0 4l-4 4a3 3 0 0 1-4 0l-8-8a3 3 0 0 1 0-4Z"/><path d="m9 9 6 6M11 7l2 2M7 11l2 2M15 13l2 2M13 17l2 2"/></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7s-.8 1.6-2.3 3.2M6.6 6.6C3.8 8.3 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5"/></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
