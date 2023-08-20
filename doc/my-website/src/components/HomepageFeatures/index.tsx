import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Png: any;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '可视化',
    Png: require('@site/static/img/data_view.png').default,
    description: (
      <>
        点选、拖拽、缩放的可视化操作，支持群组/解散、撤销/重做、图层显示/隐藏、锁定/解锁、对齐和排序。
      </>
    ),
  },
  {
    title: '可扩展',
    Png: require('@site/static/img/extend.png').default,
    description: (
      <>
        支持使用React、Vue开发属于你的组件库，构建自己的生态系统。
      </>
    ),
  },
  {
    title: '样式隔离，组件通信',
    Png: require('@site/static/img/css.png').default,
    description: (
      <>
        基本于ShadowDOM样式隔离，确保组件样式互不干扰。通过消息事件组件间可以相互通信，甚至可以跨页面通信。
      </>
    ),
  },
];

function Feature({title, Png, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* <Svg className={styles.featureSvg} role="img" /> */}
        <img src={Png} height={226} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
