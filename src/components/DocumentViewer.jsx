import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

function DocumentViewer({ fileUrl, onClose }) {
    if (!fileUrl) return null;

    return (
        <div className="document-viewer-overlay">
            <div className="document-viewer">
                <button className="close-btn" onClick={onClose}>❌ Cerrar</button>
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                    <Viewer fileUrl={fileUrl} />
                </Worker>
            </div>
        </div>
    );
}

export default DocumentViewer;
