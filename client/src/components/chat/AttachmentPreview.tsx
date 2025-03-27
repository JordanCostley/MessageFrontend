import { FileText, Download, Image as ImageIcon } from "lucide-react";
import { type Attachment } from "@shared/schema";

interface AttachmentPreviewProps {
  attachment: Attachment;
  containerless?: boolean;
}

export default function AttachmentPreview({ attachment, containerless = false }: AttachmentPreviewProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.fileName);
  
  // For containerless image preview
  if (containerless && isImage) {
    return (
      <div className="mb-2 rounded-lg overflow-hidden">
        <img 
          src={attachment.url || '#'}
          alt={attachment.fileName}
          className="max-w-full max-h-[300px] object-contain rounded-lg"
        />
      </div>
    );
  }

  // For images with container or non-image attachments
  return (
    <div className="flex items-center p-2 bg-white rounded-md mb-2 max-w-xs">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-md text-primary">
        {isImage ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
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
