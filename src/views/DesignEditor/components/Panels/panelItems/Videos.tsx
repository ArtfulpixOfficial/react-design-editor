import React, { useState } from "react"
import { useStyletron } from "baseui"
import { Block } from "baseui/block"
import AngleDoubleLeft from "~/components/Icons/AngleDoubleLeft"
import Scrollable from "~/components/Scrollable"
import { useEditor } from "@layerhub-io/react"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"
import { getPixabayVideos } from "~/services/pixabay"
import { getPexelsVideos } from "~/services/pexels"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import InfiniteScrolling from "~/components/InfiniteScrolling"
import Search from "~/components/Icons/Search"
import { Input } from "baseui/input"
import { Spinner, SIZE } from "baseui/spinner"

const loadVideoResource = (videoSrc: string): Promise<HTMLVideoElement> => {
  return new Promise(function (resolve, reject) {
    var video = document.createElement("video")
    video.crossOrigin = "anonymous"
    video.src = videoSrc
    video.addEventListener("loadedmetadata", function (event) {
      video.currentTime = 1
    })

    video.addEventListener("seeked", function () {
      resolve(video)
    })

    video.addEventListener("error", function (error) {
      reject(error)
    })
  })
}

const captureFrame = (video: HTMLVideoElement) => {
  return new Promise(function (resolve) {
    var canvas = document.createElement("canvas") as HTMLCanvasElement
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(video.src)

    const data = canvas.toDataURL()

    fetch(data)
      .then((res) => {
        return res.blob()
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        resolve(url)
      })
  })
}

const captureDuration = (video: HTMLVideoElement): Promise<number> => {
  return new Promise((resolve) => {
    resolve(video.duration)
  })
}

const Videos = () => {
  const editor = useEditor()
  const setIsSidebarOpen = useSetIsSidebarOpen()
  const [videos, setVideos] = React.useState<any[]>([])
  const { scenes, setScenes, currentScene } = useDesignEditorContext()
  const [hasMore, setHasMore] = React.useState(true)
  const [pageNumber, setPageNumber] = React.useState(1)
  const [isloading, setIsloading] = React.useState(true)
  const [category, setCategory] = useState<string>("")
  const loadPixabayVideos = async () => {
    const videos = (await getPixabayVideos("people")) as any
    setVideos(videos)
  }

  const loadPexelsVideos = async () => {
    const videos = (await getPexelsVideos("people", 1)) as any
    setVideos(videos)
  }

  const fetchData = React.useCallback(
    async (reset?: boolean) => {
      setIsloading(true)

      const newVideos: any = await getPexelsVideos(category || "people", pageNumber)
      // const newImages = await getPixabayImages(category || "nature")

      if (newVideos.length === 0) {
        setHasMore(false)
        setIsloading(false)
        return
      }

      let all = [...videos, ...newVideos]
      // Set only new images if reset = true. It should be useful for new queries
      if (reset) {
        all = newVideos
      }
      // @ts-ignore
      setVideos(all)
      setPageNumber(pageNumber + 1)
      setIsloading(false)
    },
    [pageNumber, hasMore, category, videos]
  )
  React.useEffect(() => {
    loadPexelsVideos()
    // loadPixabayVideos()
  }, [])

  const makeSearch = () => {
    setVideos([])
    setPageNumber(1)
    setIsloading(true)
    fetchData(true)
  }
  const addObject = React.useCallback(
    async (options: any) => {
      if (editor) {
        const video = await loadVideoResource(options.src)
        const frame = await captureFrame(video)
        const duration = await captureDuration(video)
        editor.objects.add({ ...options, duration, preview: frame })
        const updatedScenes = scenes.map((scn) => {
          if (scn.id === currentScene?.id) {
            return {
              ...currentScene,
              duration: duration * 1000 > currentScene.duration! ? duration * 1000 : currentScene.duration!,
            }
          }
          return scn
        })
        setScenes(updatedScenes)
      }
    },
    [editor, scenes, currentScene]
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
        <Block>Videos</Block>

        <Block onClick={() => setIsSidebarOpen(false)} $style={{ cursor: "pointer", display: "flex" }}>
          <AngleDoubleLeft size={18} />
        </Block>
      </Block>
      <Block $style={{ padding: "1.5rem 1.5rem 1rem" }}>
        <Input
          overrides={{
            Root: {
              style: {
                paddingLeft: "8px",
              },
            },
          }}
          onKeyDown={(key) => key.code === "Enter" && makeSearch()}
          onBlur={makeSearch}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Search"
          size={"compact"}
          startEnhancer={<Search size={16} />}
        />
      </Block>
      <Scrollable>
        <Block>
          <InfiniteScrolling fetchData={fetchData} hasMore={hasMore}>
            <Block style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr 1fr", padding: "0 1.5rem" }}>
              {videos.map((video, index) => {
                return <ImageItem key={index} preview={video.preview} onClick={() => addObject(video)} />
              })}
            </Block>
            <Block
              $style={{
                display: "flex",
                justifyContent: "center",
                paddingY: "2rem",
              }}
            >
              {isloading && <Spinner $size={SIZE.small} />}
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
        "::before:hover": {
          opacity: 1,
        },
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

export default Videos
