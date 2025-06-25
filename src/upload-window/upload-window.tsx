import "../index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import UploadWindowApp from "./UploadWindowApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UploadWindowApp />
  </StrictMode>
);
