import { FileText, Download } from "lucide-react";
import { type Attachment } from "@shared/schema";

interface AttachmentPreviewProps {
  attachment: Attachment;
}

export default function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  const getFileIcon = (fileType: string) => {
    // Could be expanded to handle more file types
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'file-text';
      case 'doc':
      case 'docx':
        return 'file-text';
      case 'xls':
      case 'xlsx':
        return 'file-spreadsheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'file';
    }
  };

  return (
    <div className="flex items-center p-2 bg-white rounded-md mb-2 max-w-xs">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-md text-primary">
        <FileText className="h-6 w-6" />
      </div>
      <div className="ml-3 overflow-hidden">
        <p className="text-sm font-medium text-neutral-800 truncate">
          {attachment.fileName}
        </p>
        <p className="text-xs text-neutral-500">{attachment.fileSize}</p>
      </div>
      <button className="ml-2 p-1.5 text-primary hover:bg-blue-50 rounded-full transition-colors">
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
