import { useEffect } from 'react'

export default (props: { title: string; children: any }) => {
  useEffect(() => {
    document.title = props.title
  }, [props.title])

  return props.children
}
