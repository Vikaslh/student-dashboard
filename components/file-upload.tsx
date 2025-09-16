"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onUploadSuccess: () => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setErrorMessage("Please select a CSV file")
        setUploadStatus("error")
        return
      }

      setFile(selectedFile)
      setUploadStatus("idle")
      setErrorMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-dataset", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus("success")
        onUploadSuccess()
      } else {
        setUploadStatus("error")
        setErrorMessage(result.error || "Upload failed")
      }
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage("Network error occurred")
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus("idle")
    setErrorMessage("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Dataset
        </CardTitle>
        <CardDescription>Upload your own student data CSV file or use the generated sample data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
          <p className="text-sm text-muted-foreground">
            Expected columns: student_id, name, class, comprehension, attention, focus, retention, assessment_score,
            engagement_time
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
            <Button variant="ghost" size="sm" onClick={resetUpload}>
              ×
            </Button>
          </div>
        )}

        {uploadStatus === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Dataset uploaded successfully! The dashboard will now use your data.</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
            {uploading ? "Uploading..." : "Upload Dataset"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
