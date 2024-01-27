import FileUpload from "./components/fileupload";

import "./App.css";

function App() {
  return (
    <>
      <div className="border">
        <h1>Upload JSON File to S3</h1>
        <FileUpload />
      </div>
    </>
  );
}

export default App;
