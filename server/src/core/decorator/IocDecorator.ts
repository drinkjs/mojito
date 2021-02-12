const injectables: Map<any, any> = new Map();

export const INJECTABLE_METADATA = "injectable_metadata";

// eslint-disable-next-line no-unused-vars
export type Constructor<T = any> = new (...args: any[]) => T;

export const IocFactory = (target: Constructor<any>): any => {
  // 获取所有注入的服务
  const providers = Reflect.getMetadata("design:paramtypes", target); // [OtherService]
  const args = providers
    ? providers.map(
      (provider: Constructor) =>
        injectables.get(provider) || IocFactory(provider)
    )
    : [];
  // eslint-disable-next-line new-cap
  return new target(...args);
};

export const Injectable = (): ClassDecorator => (target) => {
  const Obj: Constructor<any> = (target as unknown) as Constructor<any>;
  if (!injectables.get(target)) {
    injectables.set(target, IocFactory(Obj));
  }
};
