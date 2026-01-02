"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageIcon, Upload, Trash2, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedMeme {
  key: string
  url: string
  timestamp: number
}

export default function MemePage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedMemes, setUploadedMemes] = useState<UploadedMeme[]>([])
  const [view, setView] = useState<"upload" | "gallery">("upload")
  const { toast } = useToast()

  const API_BASE_URL = "/api/backend"

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${API_BASE_URL}/memes/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const key = await response.text()
      const newMeme: UploadedMeme = {
        key,
        url: URL.createObjectURL(file),
        timestamp: Date.now(),
      }

      setUploadedMemes((prev) => [newMeme, ...prev])
      toast({
        title: "Upload successful!",
        description: "Your meme has been uploaded to the cloud.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your meme.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length === 0) {
        toast({
          title: "Invalid file type",
          description: "Please upload image files only.",
          variant: "destructive",
        })
        return
      }

      for (const file of imageFiles) {
        await uploadFile(file)
      }
    },
    [toast],
  )

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await uploadFile(file)
    }
  }

  const handleDownload = async (meme: UploadedMeme) => {
    try {
      const response = await fetch(`${API_BASE_URL}/memes/download?key=${encodeURIComponent(meme.key)}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = meme.key.split("/").pop() || "meme.jpg"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the meme.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (index: number) => {
    setUploadedMemes((prev) => prev.filter((_, i) => i !== index))
    toast({
      title: "Meme removed",
      description: "The meme has been removed from your gallery.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-secondary">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-background mb-4 tracking-tight">
            MEME
            <span className="block text-5xl md:text-7xl mt-2">VAULT</span>
          </h1>
          <p className="text-background/80 text-lg md:text-xl font-medium">
            Your personal meme collection in the cloud
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setView("upload")}
            variant={view === "upload" ? "default" : "secondary"}
            size="lg"
            className="text-lg px-8"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload
          </Button>
          <Button
            onClick={() => setView("gallery")}
            variant={view === "gallery" ? "default" : "secondary"}
            size="lg"
            className="text-lg px-8"
          >
            <Eye className="mr-2 h-5 w-5" />
            Gallery ({uploadedMemes.length})
          </Button>
        </div>

        {/* Upload View */}
        {view === "upload" && (
          <Card className="p-8 md:p-12 bg-background/95 backdrop-blur border-4 border-foreground shadow-2xl">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-4 border-dashed rounded-xl p-12 md:p-20 text-center transition-all duration-300
                ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-muted-foreground/40 hover:border-primary/60 hover:bg-accent/30"
                }
                ${isUploading ? "opacity-50 pointer-events-none" : ""}
              `}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />

              <div className="pointer-events-none">
                <div className="mx-auto w-24 h-24 md:w-32 md:h-32 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  {isUploading ? "Uploading..." : "Drop your memes here"}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">or click to browse your files</p>

                <div className="flex flex-wrap gap-2 justify-center text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-muted rounded-full">JPG</span>
                  <span className="px-3 py-1 bg-muted rounded-full">PNG</span>
                  <span className="px-3 py-1 bg-muted rounded-full">GIF</span>
                  <span className="px-3 py-1 bg-muted rounded-full">WEBP</span>
                </div>
              </div>
            </div>

            {uploadedMemes.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-lg text-muted-foreground">
                  {uploadedMemes.length} {uploadedMemes.length === 1 ? "meme" : "memes"} uploaded
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Gallery View */}
        {view === "gallery" && (
          <div>
            {uploadedMemes.length === 0 ? (
              <Card className="p-20 bg-background/95 backdrop-blur border-4 border-foreground shadow-2xl text-center">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">No memes yet</h2>
                <p className="text-muted-foreground text-lg mb-6">Upload some memes to see them here</p>
                <Button onClick={() => setView("upload")} size="lg">
                  Start Uploading
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedMemes.map((meme, index) => (
                  <Card
                    key={`${meme.key}-${index}`}
                    className="overflow-hidden bg-background border-4 border-foreground shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={meme.url || "/placeholder.svg"}
                        alt="Uploaded meme"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground font-mono truncate">{meme.key}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(meme)} className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
