import React, { useState } from "react"
import { useStyletron } from "baseui"
import { Block } from "baseui/block"
import { Button, SIZE } from "baseui/button"
import AngleDoubleLeft from "~/components/Icons/AngleDoubleLeft"
import Scrollable from "~/components/Scrollable"
import InfiniteScrolling from "~/components/InfiniteScrolling"
// import { vectors } from "~/constants/mock-data"
import { useEditor } from "@layerhub-io/react"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"
import api from "~/services/api"
const Graphics = () => {
  const inputFileRef = React.useRef<HTMLInputElement>(null)

  const editor = useEditor()
  const [hasMore, setHasMore] = React.useState(true)
  const [vectors, setVectors] = useState([])
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

      const newVectors = await api.getPixabayImages({
        query: category || "people",
        perPage: 12,
        page: pageNumber,
        imageType: "vector",
      })
      // const newImages = await getPixabayImages(category || "nature")

      if (newVectors.length === 0) {
        setHasMore(false)
        setIsloading(false)
        return
      }

      let all = [...vectors, ...newVectors]
      // Set only new images if reset = true. It should be useful for new queries
      if (reset) {
        all = newVectors
      }
      // @ts-ignore
      setVectors(all)
      setPageNumber(pageNumber + 1)
      setIsloading(false)
    },
    [pageNumber, hasMore, category, vectors]
  )

  const makeSearch = () => {
    setVectors([])
    setPageNumber(1)
    setIsloading(true)
    fetchData(true)
  }

  const handleDropFiles = (files: FileList) => {
    const file = files[0]
    const url = URL.createObjectURL(file)
    editor.objects.add({
      src: url,
      type: "StaticVector",
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDropFiles(e.target.files!)
  }

  const handleInputFileRefClick = () => {
    inputFileRef.current?.click()
  }

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
        <Block>Graphics</Block>

        <Block onClick={() => setIsSidebarOpen(false)} $style={{ cursor: "pointer", display: "flex" }}>
          <AngleDoubleLeft size={18} />
        </Block>
      </Block>

      <Block padding="0 1.5rem">
        <Button
          onClick={handleInputFileRefClick}
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
      </Block>
      <Scrollable>
        <input onChange={handleFileInput} type="file" id="file" ref={inputFileRef} style={{ display: "none" }} />
        <Block>
          <InfiniteScrolling fetchData={fetchData} hasMore={hasMore}>
            <Block $style={{ display: "grid", gap: "8px", padding: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
              {vectors.map((vector: any, index) => {
                return <GraphicItem onClick={() => addObject(vector.src)} key={index} preview={vector.preview} />
              })}
            </Block>
          </InfiniteScrolling>
        </Block>
      </Scrollable>
    </Block>
  )
}

const GraphicItem = ({ preview, onClick }: { preview: any; onClick?: (option: any) => void }) => {
  const [css] = useStyletron()
  return (
    <div
      onClick={onClick}
      // onClick={() => onClick(component.layers[0])}
      className={css({
        position: "relative",
        height: "84px",
        background: "#f8f8fb",
        cursor: "pointer",
        padding: "12px",
        borderRadius: "10px",
        overflow: "hidden",
        // "::before:hover": {
        //   opacity: 1,
        // },
      })}
    >
      <div
        className={css({
          backgroundImage: `linear-gradient(to bottom,
          rgba(0, 0, 0, 0) 0,
          rgba(0, 0, 0, 0.006) 8.1%,
          rgba(0, 0, 0, 0.022) 15.5%,
          rgba(0, 0, 0, 0.047) 22.5%,
          rgba(0, 0, 0, 0.079) 29%,
          rgba(0, 0, 0, 0.117) 35.3%,
          rgba(0, 0, 0, 0.158) 41.2%,
          rgba(0, 0, 0, 0.203) 47.1%,
          rgba(0, 0, 0, 0.247) 52.9%,
          rgba(0, 0, 0, 0.292) 58.8%,
          rgba(0, 0, 0, 0.333) 64.7%,
          rgba(0, 0, 0, 0.371) 71%,
          rgba(0, 0, 0, 0.403) 77.5%,
          rgba(0, 0, 0, 0.428) 84.5%,
          rgba(0, 0, 0, 0.444) 91.9%,
          rgba(0, 0, 0, 0.45) 100%)`,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
          height: "100%",
          width: "100%",
          ":hover": {
            opacity: 1,
          },
        })}
      />
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

export default Graphics
