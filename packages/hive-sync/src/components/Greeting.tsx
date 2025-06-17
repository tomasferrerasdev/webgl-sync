import React from "react";

interface GreetingProps {
  name?: string;
  message?: string;
}

export const Greeting: React.FC<GreetingProps> = ({
  name = "World",
  message = "Welcome to Hive Sync!",
}) => {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        textAlign: "center",
        maxWidth: "400px",
        margin: "20px auto",
      }}
    >
      <h2>Hello, {name}!</h2>
      <p>{message}</p>
    </div>
  );
};

export default Greeting;
