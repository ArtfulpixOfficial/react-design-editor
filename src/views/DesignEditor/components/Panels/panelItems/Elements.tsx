import React, { useState } from "react"
import { useEditor } from "@layerhub-io/react"
import { useStyletron } from "baseui"
import { Block } from "baseui/block"
import InfiniteScrolling from "~/components/InfiniteScrolling"
import { Button, SIZE } from "baseui/button"
import AngleDoubleLeft from "~/components/Icons/AngleDoubleLeft"
import Scrollable from "~/components/Scrollable"
// import { graphics } from "~/constants/mock-data"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"
import api from "~/services/api"

const Elements = () => {
  const editor = useEditor()
  const [graphics, setGraphics] = useState([])
  const [hasMore, setHasMore] = React.useState(true)
  const [pageNumber, setPageNumber] = React.useState(1)
  const [isloading, setIsloading] = React.useState(true)
  const [category, setCategory] = useState<string>("")
  const setIsSidebarOpen = useSetIsSidebarOpen()
  const addObject = React.useCallback(
    (url: string) => {
      if (editor) {
        const options = {
          type: "StaticImage",
          src: url,
        }
        editor.objects.add(options)
      }
    },
    [editor]
  )
  const fetchData = React.useCallback(
    async (reset?: boolean) => {
      setIsloading(true)

      const newGraphics = await api.getPixabayImages({
        query: category || "people",
        perPage: 12,
        page: pageNumber,
        imageType: "illustration",
      })
      // const newImages = await getPixabayImages(category || "nature")

      if (newGraphics.length === 0) {
        setHasMore(false)
        setIsloading(false)
        return
      }

      let all = [...graphics, ...newGraphics]
      // Set only new images if reset = true. It should be useful for new queries
      if (reset) {
        all = newGraphics
      }
      // @ts-ignore
      setGraphics(all)
      setPageNumber(pageNumber + 1)
      setIsloading(false)
    },
    [pageNumber, hasMore, category, graphics]
  )
  return (
    <Block $style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Block
        $style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 500,
          justifyContent: "space-between",
          padding: "1.5rem",
        }}
      >
        <Block>Elements</Block>

        <Block onClick={() => setIsSidebarOpen(false)} $style={{ cursor: "pointer", display: "flex" }}>
          <AngleDoubleLeft size={18} />
        </Block>
      </Block>
      <Scrollable>
        {/* <Block padding={"0 1.5rem"}>
          <Button
            size={SIZE.compact}
            overrides={{
              Root: {
                style: {
                  width: "100%",
                },
              },
            }}
          >
            Computer
          </Button>
        </Block> */}
        <Block>
          <InfiniteScrolling fetchData={fetchData} hasMore={hasMore}>
            <Block $style={{ display: "grid", gap: "8px", padding: "1.5rem", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              {graphics.map((graphic: any, index) => {
                console.log(graphic)
                return <ImageItem onClick={() => addObject(graphic.src)} key={index} preview={graphic.preview} />
              })}
            </Block>
          </InfiniteScrolling>
        </Block>
      </Scrollable>
    </Block>
  )
}

const ImageItem = ({ preview, onClick }: { preview: any; onClick?: (option: any) => void }) => {
  const [css] = useStyletron()
  return (
    <div
      onClick={onClick}
      className={css({
        position: "relative",
        background: "#f8f8fb",
        cursor: "pointer",
        borderRadius: "8px",
        overflow: "hidden",
        ":hover": {
          opacity: 1,
          background: "rgb(233,233,233)",
        },
      })}
    >
      <img
        src={preview}
        className={css({
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          verticalAlign: "middle",
        })}
      />
    </div>
  )
}

export default Elements
