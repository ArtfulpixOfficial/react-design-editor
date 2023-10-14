import axios from "axios"

const pixabayClient = axios.create({
  baseURL: "https://pixabay.com/api/",
  // maxRedirects: 5,
})
// pixabayClient.interceptors.request.use((config) => {
//   config.headers["Access-Control-Allow-Origin"] = "*" // Allow requests from any origin
//   return config
// })
const PIXABAY_KEY = import.meta.env.VITE_APP_PIXABAY_KEY

export interface PixabayImage {
  id: string
  webformatURL: string
  previewURL: string
}

export const getPixabayImages = (
  query: string,
  perPage: number,
  page: number,
  imageType: string
): Promise<PixabayImage[]> => {
  const encodedWord = query.replace(/\s+/g, "+").toLowerCase()
  return new Promise((resolve, reject) => {
    pixabayClient
      .get(`?key=${PIXABAY_KEY}&q=${encodedWord}&image_type=${imageType}&per_page=${perPage}&page=${page}`)
      .then((response) => {
        resolve(response.data.hits)
      })
      .catch((err) => reject(err))
  })
}

export const getPixabayVideos = (query: string): Promise<PixabayImage[]> => {
  const encodedWord = query.replace(/\s+/g, "+").toLowerCase()
  return new Promise((resolve, reject) => {
    pixabayClient
      .get(`/videos?key=${PIXABAY_KEY}&q=${encodedWord}&per_page=20`)
      .then((response) => {
        const hits = response.data.hits
        const videos = hits.map((hit: any) => ({
          id: hit.id,
          type: "StaticVideo",
          src: hit.videos.tiny.url,
          preview: `https://i.vimeocdn.com/video/${hit.picture_id}.jpg`,
          duration: hit.duration,
        }))
        resolve(videos)
      })
      .catch((err) => reject(err))
  })
}
