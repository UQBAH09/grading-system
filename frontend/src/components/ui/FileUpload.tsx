import { cn } from '@/lib/utils'
import { Upload, File } from 'lucide-react'
import { useCallback, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  className?: string
}

export function FileUpload({ onFileSelect, accept, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileSelect(file)
  }, [onFileSelect])

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {selectedFile ? (
        <div className="flex flex-col items-center gap-2">
          <File className="w-10 h-10 text-primary" />
          <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drag and drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, PNG, JPG up to 10MB
          </p>
        </div>
      )}
    </div>
  )
}
