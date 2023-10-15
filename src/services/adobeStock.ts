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

export const getStockTemplate = (query: string): Promise<IDesign[]> => {
  return new Promise((resolve, reject) => {
    adobeStockClient
      .get(
        `/Rest/Media/1/Search/Files?search_parameters[words]=${query}&search_parameters[limit]=${12}&search_parameters[filters][content_type:template]=${1}`
      )
      .then(({ data: { files } }) => {
        console.log(files)
        const templates = files.map((template: any) => ({
          id: template.id,
          type: "Design",
          name: template.title,
          previews: {
            id: template.id,
            src: template.thumbnail_url,
          },
          published: false,
          metadata: {},
        }))
        resolve(templates)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
