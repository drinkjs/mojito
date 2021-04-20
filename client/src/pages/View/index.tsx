import React, { useEffect, useRef } from "react";
import { observer, inject } from "mobx-react";
import { Skeleton } from "antd";
import DocumentTitle from "components/DocumentTitle";
import { useParams, useLocation } from "react-router-dom";
import { useInterval, useUpdateEffect } from "ahooks";
import { joinPage, useReconnect } from "common/stateTool";
import Layer from "pages/editor/components/Layer";
import { toJS } from "mobx";
import { ScreenStore } from "types";
import { DefaulBackgroundColor, DefaultLayerSize } from "config";

interface Props {
  screenStore?: ScreenStore;
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default inject("screenStore")(
  observer((props: Props) => {
    const { screenStore } = props;
    const screenInfo = screenStore!.screenInfo;
    const rootRef = useRef<HTMLDivElement>();
    const zoomRef = useRef<HTMLDivElement>();
    const isPreview = useQuery().get("preview") === "1";
    const { projectName, screenName } = useParams<{
      projectName: string;
      screenName: string;
    }>();

    /**
     * 自适应
     */
    useUpdateEffect(() => {
      function handleResize () {
        if (
          !screenStore!.screenInfo?.style ||
          !rootRef.current ||
          !zoomRef.current
        ) {
          return;
        }
        const { style } = screenStore!.screenInfo;
        if (
          style.width < window.innerHeight &&
          style.height < window.innerHeight
        ) {
          return;
        }
        let zoom = 1;
        if (style.width > style.height) {
          zoom = window.innerWidth / style.width;
        } else {
          zoom = window.innerHeight / style.height;
        }

        rootRef.current.style.transform = `scale(${zoom})`;
        rootRef.current.style.transformOrigin = "0 0 0";
        zoomRef.current.style.width = `${style.width * zoom}px`;
        zoomRef.current.style.height = `${style.height * zoom}px`;
      }
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, [screenStore!.screenInfo]);

    useEffect(() => {
      screenStore!.getDetailByName(projectName, screenName).then((data) => {
        data && joinPage(data.project.name);
      });
    }, [projectName, screenName]);

    useInterval(
      () => {
        screenStore!.reload();
      },
      isPreview ? 3000 : null
    );

    // 断线重连
    useReconnect(() => {
      screenStore!.screenInfo && joinPage(screenStore!.screenInfo.project.id);
    });

    const { style, layers } = screenInfo || {
      layout: undefined,
      layers: undefined
    };

    return (
      <DocumentTitle title={screenInfo ? screenInfo.name : ""}>
        <Skeleton loading={screenStore!.getDetailLoading}>
          <div
            style={{
              minHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              ref={(ref) => {
                zoomRef.current = ref!;
              }}
              style={{ margin: "auto", width: style?.width }}
            >
              {style && (
                <div
                  ref={(ref) => {
                    rootRef.current = ref!;
                  }}
                  style={{
                    ...style,
                    backgroundColor:
                      style.backgroundColor || DefaulBackgroundColor,
                    backgroundImage: style.backgroundImage
                      ? `url(${style.backgroundImage})`
                      : "none",
                    backgroundSize:
                      style.backgroundRepeat === "no-repeat"
                        ? "100% 100%"
                        : undefined,
                    backgroundRepeat: style.backgroundRepeat,
                    color: style.color,
                    position: "relative",
                    overflow: "hidden",
                    zIndex: 1
                  }}
                >
                  {layers &&
                    layers.map((v) => {
                      return (
                        <Layer
                          enable={false}
                          data={toJS(v)}
                          key={v.id}
                          defaultWidth={DefaultLayerSize.width}
                          defaultHeight={DefaultLayerSize.height}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </Skeleton>
      </DocumentTitle>
    );
  })
);
