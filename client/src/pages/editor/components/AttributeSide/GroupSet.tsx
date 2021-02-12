/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import { ScreenStore } from 'types'
import { toJS } from 'mobx'
import Eventer from 'common/eventer'
import styles from './index.module.scss'
import { SizeItem } from './Style'

interface Props {
  screenStore?: ScreenStore;
}

export const CHANGE_GROUP = Symbol('CHANGE_GROUP')

let timerId: any

const sizeItems = [
  {
    label: 'X轴',
    key: 'x'
  },
  {
    label: 'Y轴',
    key: 'y'
  },
  {
    label: '宽',
    key: 'width'
  },
  {
    label: '高',
    key: 'height'
  }
]
/**
 * 限流函数
 * @param callback
 */
const limitChange = (callback: Function, timeout: number = 500) => {
  if (timerId) {
    clearTimeout(timerId)
  }
  timerId = setTimeout(callback, timeout)
}

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props
    const { layerGroupRect } = screenStore || {}
    const [defaultStyle, setDefaultStyle] = useState<any>(layerGroupRect)

    useEffect(() => {
      return () => {
        clearTimeout(timerId)
      }
    }, [])

    useEffect(() => {
      setDefaultStyle(toJS(layerGroupRect))
    }, [layerGroupRect])

    const onStyleChange = (type: string, value: any) => {
      if (isNaN(value)) return
      const newStyle: any = { ...defaultStyle, [type]: value }
      setDefaultStyle(newStyle)
      limitChange(() => {
        const { x, y, width, height } = newStyle
        if (layerGroupRect) {
          Eventer.emit(CHANGE_GROUP, {
            ...newStyle,
            offsetX: x - layerGroupRect.x,
            offsetY: y - layerGroupRect.y,
            offsetWidth: width / layerGroupRect.width,
            offsetHeight: height / layerGroupRect.height
          })
        }
      })
    }

    return (
      <section className={styles.styleSetting}>
        <div className={styles.title}>
          <p>群组位置和尺寸</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {sizeItems.map((v) => {
              return (
                <SizeItem
                  key={v.key}
                  label={v.label}
                  onChange={(value) => {
                    onStyleChange(v.key, value)
                  }}
                  value={defaultStyle && defaultStyle[v.key]}
                />
              )
            })}
          </div>
        </div>
      </section>
    )
  })
)
