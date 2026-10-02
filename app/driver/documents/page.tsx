'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Document {
  type: 'cnic' | 'license' | 'registration'
  status: 'pending' | 'approved' | 'rejected'
  uploadDate: string
  expiryDate?: string
}

const documentTypes = [
  { type: 'cnic', label: 'CNIC (National ID)', description: 'Front and back copy' },
  { type: 'license', label: 'Driving License', description: 'Valid driving license' },
  { type: 'registration', label: 'Vehicle Registration', description: 'Vehicle ownership document' },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    { type: 'cnic', status: 'approved', uploadDate: '2024-01-15', expiryDate: '2026-01-15' },
  ])
  const [uploading, setUploading] = useState(false)

  const handleUpload = (docType: string) => {
    setUploading(true)
    setTimeout(() => {
      const newDoc: Document = {
        type: docType as any,
        status: 'pending',
        uploadDate: new Date().toISOString().split('T')[0],
      }
      setDocuments([...documents, newDoc])
      setUploading(false)
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      approved: { bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800' },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <Link href="/driver/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All documents must be valid and current. Admin will review and approve them within 24-48 hours.
        </p>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {documentTypes.map((doc) => {
          const uploaded = documents.find((d) => d.type === doc.type)
          return (
            <div key={doc.type} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-2">{doc.label}</h3>
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

              {uploaded ? (
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Uploaded: {uploaded.uploadDate}</p>
                  {getStatusBadge(uploaded.status)}
                  {uploaded.status === 'rejected' && (
                    <p className="text-xs text-red-600 mt-2">Please resubmit your document</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">Not uploaded yet</p>
              )}

              <Button
                onClick={() => handleUpload(doc.type)}
                disabled={uploading}
                className="w-full"
                variant={uploaded ? 'outline' : 'default'}
              >
                {uploaded ? 'Reupload' : 'Upload'}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Document Status Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Document</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Upload Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.map((doc, idx) => {
              const docLabel = documentTypes.find((d) => d.type === doc.type)?.label
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{docLabel}</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(doc.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.uploadDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.expiryDate || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
