import Tooltip from '@components/UIElements/Tooltip'
import { useTheme } from 'next-themes'
import React from 'react'
import { MdOutlineDarkMode, MdOutlineWbSunny } from 'react-icons/md'

const ToggleTheme = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col items-center space-y-2">
      <Tooltip
        placement="right"
        content={theme === 'light' ? 'Swtich to Dark' : 'Switch to Light'}
      >
        <button
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark')
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none opacity-70 hover:opacity-100"
        >
          {theme === 'light' ? <MdOutlineDarkMode /> : <MdOutlineWbSunny />}
        </button>
      </Tooltip>
    </div>
  )
}

export default ToggleTheme
