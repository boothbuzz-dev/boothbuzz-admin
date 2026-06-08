import React from 'react';
import { FileText, Download, Eye, Printer } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { DownloadBRD } from '../components/DownloadBRD';

export const BRDDownload: React.FC = () => {
  const handleViewBRD = () => {
    window.open('/documents/Society_Events_BRD.html', '_blank');
  };

  const handleDownloadWord = () => {
    // For Word format, we'll provide the HTML file which can be opened in Word
    const link = document.createElement('a');
    link.href = '/documents/Society_Events_BRD.html';
    link.download = 'Society_Events_BRD.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Requirements Document</h1>
        <p className="text-lg text-gray-600 mb-6">
          Society Events Management Platform - Complete BRD Documentation
        </p>
      </div>

      {/* Document Info Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Requirements Document</h2>
              <p className="text-gray-600">Version 1.0 | January 2025</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Document Information</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">January 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Final</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium">~25 pages</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Document Contents</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div>• Executive Summary</div>
                  <div>• Business Requirements</div>
                  <div>• Functional Requirements</div>
                  <div>• Technical Architecture</div>
                  <div>• Implementation Timeline</div>
                  <div>• Risk Assessment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Document Overview</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              This comprehensive Business Requirements Document outlines the complete specifications 
              for the Society Events Management Platform. It includes detailed functional and 
              non-functional requirements, technical architecture, user roles, data models, 
              integration requirements, and implementation timeline. The document serves as the 
              foundation for development, testing, and deployment of the platform.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Download Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                onClick={handleViewBRD}
                className="flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Eye className="h-4 w-4" />
                <span>View Online</span>
              </Button>

              <Button 
                onClick={handleDownloadWord}
                className="flex items-center justify-center space-x-2"
                variant="primary"
              >
                <Download className="h-4 w-4" />
                <span>Download Word</span>
              </Button>

              <Button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/documents/Society_Events_BRD.html';
                  link.download = 'Society_Events_BRD.html';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                <span>Download HTML</span>
              </Button>

              <Button 
                onClick={() => {
                  const printWindow = window.open('/documents/Society_Events_BRD.html', '_blank');
                  if (printWindow) {
                    printWindow.onload = () => {
                      printWindow.print();
                    };
                  }
                }}
                className="flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Download Instructions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Word Format:</strong> Downloads as .doc file that can be opened in Microsoft Word</p>
              <p>• <strong>HTML Format:</strong> Downloads as .html file for web viewing</p>
              <p>• <strong>Print:</strong> Opens in new window optimized for printing</p>
              <p>• <strong>View Online:</strong> Opens the document in your browser</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Document Sections</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Executive Summary</h4>
                  <p className="text-sm text-gray-600">Project overview, objectives, and target users</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Business Requirements</h4>
                  <p className="text-sm text-gray-600">User management, society, event, vendor, and exhibitor requirements</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Functional Requirements</h4>
                  <p className="text-sm text-gray-600">Core system functions and business logic</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Non-Functional Requirements</h4>
                  <p className="text-sm text-gray-600">Performance, security, and usability requirements</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">5</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Technical Architecture</h4>
                  <p className="text-sm text-gray-600">Frontend, backend, and infrastructure specifications</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">6</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Data Requirements</h4>
                  <p className="text-sm text-gray-600">Core entities, relationships, and security</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">7</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Integration Requirements</h4>
                  <p className="text-sm text-gray-600">Payment processing, communication, and third-party services</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">8</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Success Criteria</h4>
                  <p className="text-sm text-gray-600">Business and technical metrics for success</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">9</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                  <p className="text-sm text-gray-600">Technical and business risks with mitigation strategies</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">10</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Implementation Timeline</h4>
                  <p className="text-sm text-gray-600">4-phase implementation plan over 12 months</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};