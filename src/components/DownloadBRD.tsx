import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from './UI/Button';

export const DownloadBRD: React.FC = () => {
  const handleDownload = () => {
    // Create a link to download the BRD HTML file
    const link = document.createElement('a');
    link.href = '/documents/Society_Events_BRD.html';
    link.download = 'Society_Events_BRD.html';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // Open the BRD in a new window for printing
    const printWindow = window.open('/documents/Society_Events_BRD.html', '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        onClick={handleDownload}
        className="flex items-center space-x-2"
        variant="primary"
      >
        <Download className="h-4 w-4" />
        <span>Download BRD (HTML)</span>
      </Button>
      
      <Button 
        onClick={handlePrint}
        className="flex items-center space-x-2"
        variant="outline"
      >
        <FileText className="h-4 w-4" />
        <span>Print BRD</span>
      </Button>
    </div>
  );
};