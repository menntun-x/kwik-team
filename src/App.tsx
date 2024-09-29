import React, { Suspense } from "react";
import "./styles.scss";

// Lazy load NoteEditor
const NoteEditor = React.lazy(() => import("./components/NoteEditor"));

const App: React.FC = () => {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <NoteEditor />
      </Suspense>
    </div>
  );
};

export default App;
