import React from "react";
import { motion } from "framer-motion";

export const BoxesCore = ({ className, ...rest }) => {
  const rows = new Array(50).fill(1);
  const cols = new Array(50).fill(1);

  const colors = [
    "rgb(125 211 252)",
    "rgb(249 168 212)",
    "rgb(134 239 172)",
    "rgb(253 224 71)",
    "rgb(252 165 165)",
    "rgb(216 180 254)",
    "rgb(147 197 253)",
    "rgb(165 180 252)",
    "rgb(196 181 253)",
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      style={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        zIndex: 0,
        transform: "skewX(-10deg) skewY(5deg)",
        display: "flex",
        flexWrap: "wrap",
      }}
      {...rest}
    >
      {rows.map((_, i) =>
        cols.map((_, j) => (
          <motion.div
            key={`${i}-${j}`}
            whileHover={{
              backgroundColor: getRandomColor(),
              transition: { duration: 0 },
            }}
            style={{
              width: "calc(200% / 50)",
              height: "80px",
              border: "1px solid #1e3a5f",
              boxSizing: "border-box",
            }}
          />
        ))
      )}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);