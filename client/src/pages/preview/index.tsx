import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Skeleton } from 'antd'
import DocumentTitle from 'components/DocumentTitle'
import { useParams } from 'react-router-dom'
import { joinPage, useReconnect } from 'common/stateTool'
import Layer from 'components/Layer'
import { toJS } from 'mobx'
import { ScreenLayout, ScreenStore } from 'types'
import { DefaultLayerSize } from 'config'

const { useEffect, useState } = React
interface Props {
  screenStore?: ScreenStore;
  onLayout?: (layout: ScreenLayout) => void;
}

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore, onLayout } = props
    const screenInfo = screenStore!.screenInfo
    const [initFlag, setInitFlag] = useState(false)
    const { id } = useParams<{ id: string }>()

    useEffect(() => {
      screenStore!.getDetail(id).then((data) => {
        if (data) {
          setInitFlag(true)
          if (onLayout) {
            onLayout(screenInfo!.options)
          }
        }
      })
    }, [])

    useEffect(() => {
      if (initFlag) {
        // 状态同步时join
        screenInfo && joinPage(screenInfo.project.name)
      }
    }, [initFlag, screenInfo])

    // 断线重连
    useReconnect(() => {
      screenInfo && joinPage(screenInfo.project.name)
    })

    const { options, layers } = screenInfo || {
      layout: undefined,
      layers: undefined
    }

    return (
      <DocumentTitle title={screenInfo ? screenInfo.name : ''}>
        <Skeleton loading={screenStore!.getDetailLoading}>
          {options && (
            <div>
              <div
                style={{
                  ...options,
                  backgroundColor: options.backgroundColor || '#FFF',
                  backgroundImage: options.backgroundImage
                    ? `url(${options.backgroundImage})`
                    : 'none',
                  backgroundSize:
                    options.backgroundRepeat === 'no-repeat'
                      ? '100% 100%'
                      : undefined,
                  backgroundRepeat: options.backgroundRepeat,
                  color: options.color,
                  position: 'relative',
                  overflow: 'hidden'
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
                    )
                  })}
              </div>
            </div>
          )}
        </Skeleton>
      </DocumentTitle>
    )
  })
)
