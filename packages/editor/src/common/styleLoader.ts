

export function addStyles (styles:Array<MojitoStyle>, shadowRoot:ShadowRoot) {
  const anyShadowRoot:any = shadowRoot
  const injectedStyles =
  anyShadowRoot._injectedStyles ||
    (anyShadowRoot._injectedStyles = {})
  for (let i = 0; i < styles.length; i++) {
    const item = styles[i]
    const style = injectedStyles[item.id]
    if (!style) {
      for (let j = 0; j < item.parts.length; j++) {
        addStyle(item.parts[j], shadowRoot)
      }
      injectedStyles[item.id] = true
    }
  }
}

function createStyleElement (shadowRoot:ShadowRoot) {
  const styleElement = document.createElement('style')
  shadowRoot.appendChild(styleElement)
  return styleElement
}

function addStyle (obj:StyleObjectPart, shadowRoot:ShadowRoot) {
  const styleElement = createStyleElement(shadowRoot)
  const css = obj.css
  const media = obj.media
  // const sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }

  // if (sourceMap) {
  //   // https://developer.chrome.com/devtools/docs/javascript-debugging
  //   // this makes source maps inside style tags work properly in Chrome
  //   css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
  //   // http://stackoverflow.com/a/26603875
  //   css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  // }

  // if (styleElement.styleSheet) {
  //   styleElement.styleSheet.cssText = css
  // } else {
  //   while (styleElement.firstChild) {
  //     styleElement.removeChild(styleElement.firstChild)
  //   }
  //   styleElement.appendChild(document.createTextNode(css))
  // }

  while (styleElement.firstChild) {
    styleElement.removeChild(styleElement.firstChild)
  }
  styleElement.appendChild(document.createTextNode(css))
}
