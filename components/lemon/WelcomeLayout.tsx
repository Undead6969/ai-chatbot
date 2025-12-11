"use client";

import { ReactNode } from "react";

export function WelcomeLayout({
  greeting,
  description,
  rootClass = "",
  onRootClick,
  children,
}: {
  greeting: string;
  description: string;
  rootClass?: string;
  onRootClick?: (e: React.MouseEvent) => void;
  children?: ReactNode;
}) {
  return (
    <div className={`welcome-screen ${rootClass}`} onClick={onRootClick}>
      <div className="welcome-content">
        <span className="welcome-greeting">{greeting}</span>
        <span className="welcome-description">{description}</span>
        {children}
      </div>
      <style jsx>{`
        .welcome-screen {
          background: #0a0a0a;
          overflow: auto;
          height: 100vh;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .welcome-screen::-webkit-scrollbar {
          display: none;
        }
        .welcome-content {
          margin-top: 180px;
          margin-left: auto;
          margin-right: auto;
          max-width: 1039px;
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 0 22px;
        }
        .welcome-content > span {
          margin-left: 0;
        }
        .welcome-greeting {
          line-height: 28px;
          height: 37px;
          color: #ffffff;
          font-size: 28px;
          text-align: left;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .welcome-description {
          line-height: 28px;
          color: #a0a0a0;
          font-size: 20px;
          text-align: left;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin-bottom: 32px;
        }
        @media screen and (max-width: 768px) {
          .welcome-screen {
            padding: 0px 16px;
          }
          .welcome-content {
            padding: 0 16px;
          }
          .welcome-content .welcome-greeting {
            display: none;
          }
          .welcome-content .welcome-description {
            font-size: 16px !important;
            text-align: center;
            color: #a0a0a0;
          }
        }
      `}</style>
    </div>
  );
}

