import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('picnicutkal-theme')
    return saved || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('picnicutkal-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)