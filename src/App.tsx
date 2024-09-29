import React from "react";
import NoteEditor from "./components/NoteEditor";
import "./styles.scss";

const App: React.FC = () => {
  return (
    <div className="app">
      <NoteEditor />
    </div>
  );
};

export default App;
