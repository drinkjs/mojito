import React, { useEffect, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Skeleton } from 'antd';
import DocumentTitle from 'components/DocumentTitle';
import { useParams, useLocation } from 'react-router-dom';
import { joinPage, useReconnect } from 'common/stateTool';
import Layer from 'components/Layer';
import { toJS } from 'mobx';
import { ScreenStore } from 'types';
import { DefaultLayerSize } from 'config';
import { useInterval } from 'ahooks';

interface Props {
  screenStore?: ScreenStore;
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const screenInfo = screenStore!.screenInfo;
    const [isPreview] = useState(useQuery().get('preview') === '1');
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
      screenStore!.getDetail(id).then((data) => {
        data && joinPage(data.project.name);
      });
    }, []);

    useInterval(
      () => {
        screenStore!.reload();
      },
      isPreview ? 3000 : null
    );

    // 断线重连
    useReconnect(() => {
      screenInfo && joinPage(screenInfo.project.name);
    });

    const { style, layers } = screenInfo || {
      layout: undefined,
      layers: undefined
    };

    return (
      <DocumentTitle title={screenInfo ? screenInfo.name : ''}>
        <Skeleton loading={screenStore!.getDetailLoading}>
          {style && (
            <div
              style={{
                ...style,
                backgroundColor: style.backgroundColor || '#FFF',
                backgroundImage: style.backgroundImage
                  ? `url(${style.backgroundImage})`
                  : 'none',
                backgroundSize:
                  style.backgroundRepeat === 'no-repeat'
                    ? '100% 100%'
                    : undefined,
                backgroundRepeat: style.backgroundRepeat,
                color: style.color,
                position: 'relative',
                overflow: 'hidden',
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
        </Skeleton>
      </DocumentTitle>
    );
  })
);
