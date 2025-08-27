import classes from '@/app/css/mantineErrorNotifications.module.css'

import type { loader } from '@/app/admin/blog/[blog_post]/loader'
import type { FileWithPath } from '@mantine/dropzone'

import { useLoaderData, useFetcher } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { FaCircleCheck } from 'react-icons/fa6'
import { Dropzone, MIME_TYPES } from '@mantine/dropzone'
import { Group, Text, Image, Button } from '@mantine/core'
import { FaRegFileImage, FaFileArrowUp, FaRegFileExcel } from 'react-icons/fa6'
import { sanitizeFilename } from '@/utils/sanitize'
import { envClient } from '@/data/env/envClient'
import { WSRV } from '@/lib/wsrv'

export { loader } from '@/app/admin/blog/[blog_post]/loader'
export { action } from '@/app/admin/blog/[blog_post]/action'

export default function Page() {
  const { blogPost: postgresBlogPost } = useLoaderData<typeof loader>()

  const [blogPost, setBlogPost] = useState(postgresBlogPost)

  const [imageFile, setImageFile] = useState<null | FileWithPath>()
  const imageFileName = imageFile ? sanitizeFilename(imageFile.name) : undefined
  const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : undefined

  const notificationRef = useRef<string | null>(null)
  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      notificationRef.current = notifications.show({
        loading: true,
        title: 'Uploading image_file:',
        message: `"${imageFileName}"`,
        autoClose: false,
        withCloseButton: false,
      })
    }
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.ok) {
        notifications.update({
          id: notificationRef.current!,
          loading: false,
          title: 'Successfully uploaded image_file:',
          message: `"${imageFileName}"`,
          autoClose: 2000,
          withCloseButton: false,
          icon: <FaCircleCheck size={30} color="green" />,
          color: 'white',
        })
      } else {
        notifications.update({
          id: notificationRef.current!,
          loading: false,
          title: `Failed to upload image_file: "${imageFileName}"`,
          message: fetcher.data?.error
            ? `message: ${fetcher.data.message} error: ${fetcher.data.error}`
            : `message: ${fetcher.data.message}`,
          autoClose: false,
          withCloseButton: true,
          color: 'red',
          classNames: classes,
        })
      }
    }
  }, [fetcher.state])

  return (
    <div>
      <Dropzone
        onDrop={(file) => setImageFile(file[0])}
        onReject={(files) => console.error('rejected files', files)} // NEEDS FIXING
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
        multiple={false}
        maxFiles={1}
        maxSize={5 * 1024 ** 2}
        w={640}
        h={640}
        className="mx-auto"
      >
        {imageFile ? (
          <Image
            src={imagePreviewUrl}
            onLoad={() =>
              imagePreviewUrl && URL.revokeObjectURL(imagePreviewUrl)
            }
          />
        ) : blogPost.image_file ? (
          <WSRV
            minio_folder={envClient.MINIO_FOLDER_BLOG_POSTS}
            image_file={blogPost.image_file || ''}
            alt={blogPost.image_description}
            width={640}
            height={640}
            className="mx-auto"
          />
        ) : (
          <Group
            justify="center"
            gap="xl"
            mih={220}
            style={{ pointerEvents: 'none' }}
          >
            <Dropzone.Idle>
              <FaRegFileImage size={55} color="var(--mantine-color-dimmed)" />
            </Dropzone.Idle>
            <Dropzone.Accept>
              <FaFileArrowUp size={55} color="var(--mantine-color-blue-6)" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <FaRegFileExcel size={55} color="var(--mantine-color-red-6)" />
            </Dropzone.Reject>
            <div>
              <Text size="xl" inline>
                Drag images here or click to select files
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed
                5mb
              </Text>
            </div>
          </Group>
        )}
      </Dropzone>

      <h1 className="font-tagesschrift text-center text-2xl text-orange-500 mt-2 mb-4">
        {blogPost.title}
      </h1>
      <p className="text-lg mb-12">{blogPost.content_description}</p>
      {blogPost.outline.map((chapter, index) => (
        <div key={index} className="flex flex-col mb-10">
          <h2 className="text-center text-xl mb-2 text-blue-600">
            {chapter.title}
          </h2>
          <p>{chapter.content}</p>
        </div>
      ))}
      <h2 className="text-center text-xl mb-2 text-blue-600">Conclusion</h2>
      <p>{blogPost.conclusion}</p>
      <Button
        onClick={async () => {
          const formData = new FormData()
          formData.append('blog_post_title', blogPost.title)
          formData.append('image_file', imageFile!, imageFileName!)
          await fetcher.submit(formData, {
            method: 'POST',
            encType: 'multipart/form-data',
          })
        }}
        disabled={!imageFile}
        type="button"
      >
        Upload Image
      </Button>
      <Button
        onClick={async () => {
          await fetcher.submit(
            {
              blogPost: JSON.stringify(blogPost),
            },
            {
              method: 'POST',
              encType: 'application/json',
            }
          )
        }}
        disabled={blogPost === postgresBlogPost}
        type="button"
      >
        Apply Changes
      </Button>
    </div>
  )
}
