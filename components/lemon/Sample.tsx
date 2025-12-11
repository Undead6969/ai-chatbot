"use client";

import { useState, useEffect } from "react";

const agentModeData = [
  {
    name: "Full-Stack Dev",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
        <path
          d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
          fill="rgba(57,143,255,1)"
        />
      </svg>
    ),
    questions: [
      { title: "Build a Todo List App", content: "Create a simple todo list web application with add, delete, and mark as complete features. Use HTML, CSS, and JavaScript." },
      { title: "Create a Weather Dashboard", content: "Build a weather dashboard that shows current weather and 5-day forecast using a weather API. Display temperature, humidity, and weather conditions." },
      { title: "Build a Blog Platform", content: "Create a simple blog platform where users can create, edit, and delete posts. Include a homepage that lists all posts and individual post pages." },
    ],
  },
  {
    name: "Stock Analysis",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="64 64 896 896" width="16" height="16">
        <path
          d="M904 747H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM165.7 621.8l39.7 39.5c3.1 3.1 8.2 3.1 11.3 0l234.7-233.9 97.6 97.3a32.11 32.11 0 0 0 45.2 0l264.2-263.2c3.1-3.1 3.1-8.2 0-11.3l-39.7-39.6a8.03 8.03 0 0 0-11.3 0l-235.7 235-97.7-97.3a32.11 32.11 0 0 0-45.2 0L165.7 610.5a7.94 7.94 0 0 0 0 11.3z"
          fill="rgba(255,81,81,1)"
        />
      </svg>
    ),
    questions: [
      { title: "Wuliangye Stock Analysis", content: "Can you help me analyze if Wuliangye can be estimated at 145 in the next six months" },
      { title: "Nvidia DCF Model Analysis", content: "Please use a DCF model to analyze the probability that Nvidia stock will reach $250 within the next six months (November 2025 - May 2026). Provide a web report." },
    ],
  },
  {
    name: "In-Depth Research",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15">
        <path d="M4 7.00012H44" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M4 23.0001H15" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M4 39.0001H15" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path
          d="M31.5 34.0001C36.1944 34.0001 40 30.1945 40 25.5001C40 20.8057 36.1944 17.0001 31.5 17.0001C26.8056 17.0001 23 20.8057 23 25.5001C23 30.1945 26.8056 34.0001 31.5 34.0001Z"
          fill="none"
          stroke="rgba(255,168,0,1)"
          strokeWidth="4"
        />
        <path d="M37 32.0001L44 39.0506" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    ),
    questions: [
      { title: "AI Industry Report 2025", content: "Research and compile a comprehensive report on the AI industry in 2025, including market size, key players, emerging technologies, and future trends." },
      { title: "Competitor Analysis", content: "Conduct an in-depth competitor analysis for the e-commerce industry. Compare top 5 players by market share, pricing strategy, and customer satisfaction." },
      { title: "Climate Policy Research", content: "Research global climate policies from 2020-2025. Analyze their effectiveness, compare different countries approaches, and provide recommendations." },
    ],
  },
  {
    name: "Game Prototyping",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15">
        <path
          d="M19 30L19 33C19 36.866 15.866 40 12 40V40C8.13401 40 5 36.866 5 33L5 19"
          stroke="rgba(194,116,255,1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M29 30L29 33C29 36.866 32.134 40 36 40V40C39.866 40 43 36.866 43 33L43 19"
          stroke="rgba(194,116,255,1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="5" y="8" width="38" height="22" rx="11" fill="none" stroke="rgba(194,116,255,1)" strokeWidth="4" />
        <path d="M21 19H13" stroke="rgba(194,116,255,1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M17 15V23" stroke="rgba(194,116,255,1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="32" y="15" width="4" height="4" rx="2" fill="rgba(194,116,255,1)" stroke="none" />
        <rect x="28" y="20" width="4" height="4" rx="2" fill="rgba(194,116,255,1)" stroke="none" />
      </svg>
    ),
    questions: [
      { title: "Build a Simple 2D Game", content: "Create a simple 2D platformer game prototype using JavaScript and HTML5 Canvas. Include player movement, jumping, and basic collision detection." },
      { title: "Card Game Mechanics", content: "Design and implement a turn-based card game with deck management, card effects, and AI opponent logic." },
      { title: "Puzzle Game Prototype", content: "Build a match-3 puzzle game prototype with grid-based gameplay, score tracking, and level progression system." },
    ],
  },
];

const chatModeData = [
  {
    name: "Instant Insight",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15">
        <path d="M4 7.00012H44" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M4 23.0001H15" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M4 39.0001H15" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path
          d="M31.5 34.0001C36.1944 34.0001 40 30.1945 40 25.5001C40 20.8057 36.1944 17.0001 31.5 17.0001C26.8056 17.0001 23 20.8057 23 25.5001C23 30.1945 26.8056 34.0001 31.5 34.0001Z"
          fill="none"
          stroke="rgba(255,168,0,1)"
          strokeWidth="4"
        />
        <path d="M37 32.0001L44 39.0506" stroke="rgba(255,168,0,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    ),
    questions: [
      { title: "What is Blockchain?", content: "Explain blockchain technology in simple terms" },
      { title: "Python vs JavaScript", content: "What are the main differences between Python and JavaScript?" },
      { title: "How does WiFi work?", content: "Explain how WiFi technology works in simple language" },
    ],
  },
  {
    name: "Creative Spark",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="rgba(255,193,7,1)" stroke="rgba(255,193,7,1)" strokeWidth="2" />
      </svg>
    ),
    questions: [
      { title: "Time Travel Story", content: "Give me a creative story idea about time travel" },
      { title: "Tech Startup Names", content: "Suggest unique names for a tech startup" },
      { title: "Innovative Product Ideas", content: "What are some innovative product ideas for 2025?" },
    ],
  },
  {
    name: "Brainstorming",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
        <path
          d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"
          fill="rgba(156,39,176,1)"
        />
      </svg>
    ),
    questions: [
      { title: "Social Media Campaign Ideas", content: "Brainstorm creative social media campaign ideas for a sustainable fashion brand targeting Gen Z" },
      { title: "Product Feature Ideas", content: "Help me brainstorm innovative features for a productivity app that would differentiate it from competitors" },
      { title: "Content Creation Topics", content: "Generate 10 engaging blog post topics about remote work and digital nomad lifestyle" },
    ],
  },
  {
    name: "Efficiency Boost",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
        <path
          d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"
          fill="rgba(76,175,80,1)"
        />
      </svg>
    ),
    questions: [
      { title: "Daily Schedule Organization", content: "How to organize my daily schedule better?" },
      { title: "Writing Efficiency Tips", content: "Tips for writing faster and more efficiently" },
      { title: "Email Management", content: "Best practices for email management" },
    ],
  },
];

export function Sample({ onSampleClick, workMode = "auto" }: { onSampleClick?: (content: string) => void; workMode?: string }) {
  const [selectedItem, setSelectedItem] = useState<typeof agentModeData[0] | null>(null);

  const data = workMode === "chat" ? chatModeData : agentModeData;

  const handleItemClick = (item: typeof agentModeData[0]) => {
    setSelectedItem(item);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const handleQuestionClick = (question: string) => {
    onSampleClick?.(question);
  };

  return (
    <div className="sample">
      {!selectedItem ? (
        <>
          {data.map((item, index) => (
            <div key={index} className="sample-item" onClick={() => handleItemClick(item)}>
              <div className="item-icon">{item.icon}</div>
              <div className="item-title">{item.name}</div>
            </div>
          ))}
        </>
      ) : (
        <div className="sample-expanded">
          <div className="selected-sample-item">
            <div className="item-icon">{selectedItem.icon}</div>
            <div className="item-title">{selectedItem.name}</div>
            <div className="close-btn" onClick={handleClose}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div className="questions-list">
            {selectedItem.questions.map((question, idx) => (
              <div key={idx} className="question-item" onClick={() => handleQuestionClick(question.content)}>
                {question.title}
              </div>
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        .sample {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          max-width: 1039px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        .sample-item {
          height: 35px;
          border-radius: 5px;
          background-color: #1a1a1a;
          box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 8px 8px 11px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ffffff;
        }
        .sample-item:hover {
          background-color: #252525;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .item-icon {
          width: 15px;
          height: 15px;
        }
        .sample-expanded {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .selected-sample-item {
          height: 35px;
          border-radius: 5px;
          background-color: #1a1a1a;
          box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 11px;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 7px;
          width: fit-content;
          color: #ffffff;
        }
        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          cursor: pointer;
          color: #888;
          transition: color 0.2s ease;
          margin-left: 4px;
        }
        .close-btn:hover {
          color: #ffffff;
        }
        .questions-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.75rem;
          width: 100%;
        }
        .question-item {
          padding: 12px 16px;
          border-radius: 8px;
          background-color: #1a1a1a;
          box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          line-height: 1.5;
          min-height: 60px;
          display: flex;
          align-items: center;
          color: #ffffff;
        }
        .question-item:hover {
          background-color: #252525;
          border-color: rgba(255, 199, 0, 0.3);
          transform: translateY(-1px);
          box-shadow: 0px 4px 20px 0px rgba(255, 199, 0, 0.2);
        }
        @media (max-width: 768px) {
          .sample .sample-item {
            width: 100%;
            font-size: 11px;
          }
          .questions-list {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .question-item {
            font-size: 12px;
            padding: 10px 12px;
            min-height: 50px;
          }
        }
      `}</style>
    </div>
  );
}

