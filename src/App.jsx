import React from 'react'
import DataDisplay from './components/DataDisplay'
import ChatBot from './components/ChatBot'
const App = () => {
  return (
    <>
      <div className='all-container'>
        <DataDisplay/>
        <ChatBot/>
      </div>
    </>
  )
}

export default App