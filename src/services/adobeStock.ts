//: https://stock.adobe.io/Rest/Media/1/Search/Files?search_parameters[words]=purple+clouds&locale=en_US
import axios from "axios"
import { IDesign } from "~/interfaces/DesignEditor"
const ADOBESTOCK_KEY = import.meta.env.VITE_APP_ADOBESTOCK_KEY
const adobeStockClient = axios.create({
  baseURL: "https://stock.adobe.io",
  headers: {
    "X-Product": "MySampleApp/1.0",
    "x-api-key": ADOBESTOCK_KEY,
  },
  // maxRedirects: 5,
})

export const getStockImages = (query: string, pageNumber: number) => {
  return new Promise((resolve, reject) => {
    adobeStockClient
      .get(
        `/Rest/Media/1/Search/Files?search_parameters[words]=${query}&search_parameters[limit]=${20}&search_parameters[filters][content_type:photo]=${1}&search_parameters[offset]=${
          pageNumber * 20
        }`
      )
      .then(({ data: { files } }) => {
        console.log(files)
        const images = files.map((image: any) => ({
          id: image.id,
          type: "StaticImage",
          name: image.title,
          src: image.thumbnail_url,
          preview: image.thumbnail_url,
        }))
        resolve(images)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
