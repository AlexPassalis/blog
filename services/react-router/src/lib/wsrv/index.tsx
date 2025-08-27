// https://wsrv.nl/docs/quick-reference.html

import { envClient } from '@/data/env/envClient'

type WSRVProps = {
  minio_folder: string
  image_file: string
  alt: string
  width: number
  height: number
  className: string
}

export function WSRV({
  minio_folder,
  image_file,
  alt,
  width,
  height,
  className,
}: WSRVProps) {
  const src = `${envClient.MINIO_BLOG_URL}/${minio_folder}/${image_file}`
  return (
    <img
      src={`https://images.weserv.nl/?${new URLSearchParams({
        url: src,
        default: src, // default image, when there is a problem loading the img
        width: String(width), // width of img in px
        height: String(height), // height of img in px
        l: String(9), // zlib compression level (0-9), works only when output is PNG
        af: '', // enable adaptive row filtering for reducing the .png file size.
        il: '', // enable interlacing to GIF and PNG. JPEGs become progressive.
        n: String(-1), // enable image optimization for WebP and GIF.
        q: String(75), // quality of img, works only when the output is JPG, TIFF or WEBP.
      })}`}
      alt={alt}
      className={className}
    />
  )
}
