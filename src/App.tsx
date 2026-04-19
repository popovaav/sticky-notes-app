import './App.css'
import type { Note } from './types/note'
import { useState } from 'react'

function App() {
  const [notes, setNotes] = useState<Note[]>([])

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

  return (
    <main>
      <h1>Sticky Notes</h1>
      <button onClick={createNote}>Add note</button>

      <div className="board">
        {notes.map(note => (
          <div
            key={note.id}
            className="note"
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
