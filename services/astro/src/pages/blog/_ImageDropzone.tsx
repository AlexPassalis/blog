import { useDropzone } from 'react-dropzone'

export function ImageDropzone() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone()

  return (
    <div
      {...getRootProps()}
      className="p-4 border-2 border-dashed rounded-md text-center"
    >
      <input {...getInputProps()} />
      {isDragActive
        ? 'Drop the image here…'
        : 'Drag & drop an image here, or click to select'}
    </div>
  )
}
