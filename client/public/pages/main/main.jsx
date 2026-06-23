import React from 'react'
import Menu from '../components/menu'
import Content from '../components/content'
import { useEffect } from 'react'
import useFont from '../sections/profile/theme/font'
import useFontIndex from '../sections/profile/theme/setFont'
import useTheme from '../sections/profile/theme/theme'
import useThemeIndex from '../sections/profile/theme/set-theme'
import useMode from '../sections/profile/context/mode'


const Main = () => {
  const font = useFont((state) => state.fonts)
  const fontIndex = useFontIndex((state) => state.index)

  const colorTheme = useTheme((state) => state.colorTheme)
  const themeIndex = useThemeIndex((state) => state.index)

  const mode = useMode((state) => state.mode)

  useEffect(() => {
    const root = document.documentElement

    root.className = `${mode} ${colorTheme[themeIndex].name}`
  },[themeIndex, mode])

  return (
    <main 
      className='bg-[var(--l-bg)] dark:bg-[var(--d-bg)] w-full h-[100vh] md:grid md:grid-cols-[.5fr_2fr] overflow-hidden'
      style={{fontFamily: font[fontIndex].name}}
    >
        <Menu />
        <Content />
    </main>
  )
}

export default Main
