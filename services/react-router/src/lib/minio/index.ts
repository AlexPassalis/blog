import type { FileWithPath } from '@mantine/dropzone'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'

import { Client } from 'minio'
import { envServer } from '@/data/env/envServer'
import { Readable } from 'node:stream'

const minio = new Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: envServer.MINIO_ROOT_USER,
  secretKey: envServer.MINIO_ROOT_PASSWORD,
})

export async function uploadFile(
  path: string,
  file: FileWithPath,
  file_name: string
) {
  const objectName = `${path}/${file_name}`
  const webStream = file.stream() as unknown as NodeReadableStream<Uint8Array>
  const nodeStream = Readable.fromWeb(webStream)
  await minio.putObject(
    envServer.MINIO_BUCKET,
    objectName,
    nodeStream,
    file.size
  )
}

export async function deleteFile(path: string, fileName: string) {
  const objectName = `${path}/${fileName}`
  await minio.removeObject(envServer.MINIO_BUCKET, objectName)
}
