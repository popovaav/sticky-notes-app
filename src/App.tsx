import './App.css'
import type { Note } from './types/note'
import { useState } from 'react'
import type { MouseEvent } from 'react'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const createNote = () => {
    const offset = notes.length * 20

    const newNote: Note = {
      id: crypto.randomUUID(),
      x: 100 + offset,
      y: 100 + offset,
      width: 200,
      height: 200,
    }

    setNotes(prev => [...prev, newNote])
  }

  const handleMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    note: Note
  ) => {
    setDraggingId(note.id)

    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    })
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!draggingId) return

    setNotes(prev =>
      prev.map(note => {
        if (note.id !== draggingId) return note

        return {
          ...note,
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        }
      })
    )
  }

  const handleMouseUp = () => {
    setDraggingId(null)
    setDragOffset({ x: 0, y: 0 })
  }

  return (
    <main>
      <h1>Sticky Notes</h1>
      <button onClick={createNote}>Add note</button>

      <div className="board" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        {notes.map(note => (
          <div
            key={note.id}
            className="note"
            onMouseDown={(e) => handleMouseDown(e, note)}
            style={{
              position: 'absolute',
              left: note.x,
              top: note.y,
              width: note.width,
              height: note.height,
            }}
          />
        ))}
      </div>
    </main>
  )
}

export default App;
