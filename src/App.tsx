import React from "react";
import NoteEditor from "./components/NoteEditor";
import "./styles.css";

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Note Maker</h1>
      <NoteEditor />
    </div>
  );
};

export default App;
