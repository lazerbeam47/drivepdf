import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell.jsx";
import { Landing } from "./pages/Landing.jsx";
import { Pricing } from "./pages/Pricing.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { DriveSync } from "./pages/DriveSync.jsx";
import { MergeTool } from "./tools/MergeTool.jsx";
import { SplitTool } from "./tools/SplitTool.jsx";
import { CompressTool } from "./tools/CompressTool.jsx";
import { RotateTool } from "./tools/RotateTool.jsx";
import { OcrTool } from "./tools/OcrTool.jsx";
import { BatchTool } from "./tools/BatchTool.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="tools" element={<Dashboard />} />
        <Route path="tools/merge" element={<MergeTool />} />
        <Route path="tools/split" element={<SplitTool />} />
        <Route path="tools/compress" element={<CompressTool />} />
        <Route path="tools/rotate" element={<RotateTool />} />
        <Route path="tools/ocr" element={<OcrTool />} />
        <Route path="tools/batch" element={<BatchTool />} />
        <Route path="drive-sync" element={<DriveSync />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
