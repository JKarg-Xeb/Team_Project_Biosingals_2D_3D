import React from 'react'
import WebSocket from './WebSocket'
import BioSignal_Graph from './BioSignal_Graph'

function Graph_Component () {
  return (
    <div className='flex flex-wrap w-full justify-center gap-40 items-center '>
        <BioSignal_Graph></BioSignal_Graph>
        <WebSocket></WebSocket>
    </div>
  )
}

export default Graph_Component