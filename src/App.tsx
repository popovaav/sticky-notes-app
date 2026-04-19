import './App.css'
import type { Note } from './types/note'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { clamp } from "./utils/utils.ts";

const DEFAULT_NOTE_SIZE = 200
const MIN_NOTE_SIZE = 120
const NOTE_OFFSET_STEP = 20
const INITIAL_POSITION = 100

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizingId, setResizingId] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement | null>(null)


  // Ensure drag/resize stops even if mouse is released outside the board
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingId(null)
      setResizingId(null)
      setDragOffset({ x: 0, y: 0 })
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  const createNote = () => {
    const offset = notes.length * NOTE_OFFSET_STEP

    const newNote: Note = {
      id: crypto.randomUUID(),
      x: INITIAL_POSITION + offset,
      y: INITIAL_POSITION + offset,
      width: DEFAULT_NOTE_SIZE,
      height: DEFAULT_NOTE_SIZE,
    }

    setNotes(prev => [...prev, newNote])
  }

  const getMousePosition = (e: MouseEvent<HTMLDivElement>) => {
    if (!boardRef.current) return null

    const rect = boardRef.current.getBoundingClientRect()

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleDragMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!draggingId || !boardRef.current) return

    const board = boardRef.current
    const pos = getMousePosition(e)
    if (!pos) return

    const { x: mouseX, y: mouseY } = pos

    setNotes(prev =>
      prev.map(note => {
        if (note.id !== draggingId) return note

        const newX = mouseX - dragOffset.x
        const newY = mouseY - dragOffset.y

        const maxX = board.clientWidth - note.width
        const maxY = board.clientHeight - note.height

        return {
          ...note,
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        }
      })
    )
  }

  const handleResizeMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!resizingId || !boardRef.current) return

    const board = boardRef.current
    const pos = getMousePosition(e)
    if (!pos) return

    const { x: mouseX, y: mouseY } = pos

    setNotes(prev =>
      prev.map(note => {
        if (note.id !== resizingId) return note

        const newWidth = mouseX - note.x
        const newHeight = mouseY - note.y

        return {
          ...note,
          width: clamp(newWidth, MIN_NOTE_SIZE, board.clientWidth - note.x),
          height: clamp(newHeight, MIN_NOTE_SIZE, board.clientHeight - note.y),
        }
      })
    )
  }

  const handleDragStart = (
    e: MouseEvent<HTMLDivElement>,
    note: Note
  ) => {
    if (!boardRef.current) return

    const pos = getMousePosition(e)
    if (!pos) return

    const { x: mouseX, y: mouseY } = pos

    setDraggingId(note.id)

    setDragOffset({
      x: mouseX - note.x,
      y: mouseY - note.y,
    })
  }

  const handleResizeStart = (
    e: MouseEvent<HTMLDivElement>,
    note: Note
  ) => {
    e.stopPropagation()
    setDraggingId(null)
    setResizingId(note.id)
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (resizingId) return handleResizeMove(e)
    if (draggingId) return handleDragMove(e)
  }

  const handleMouseUp = () => {
    setDraggingId(null)
    setResizingId(null)
  }

  return <main>
    <h1>Sticky Notes</h1>
    <button onClick={createNote}>Add note</button>

    <div
      ref={boardRef}
      className="board"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {notes.map(note => (
        <div
          key={note.id}
          className={`note ${note.id === draggingId ? 'dragging' : ''} ${note.id === resizingId ? 'resizing' : ''}`}
          onMouseDown={(e) => handleDragStart(e, note)}
          style={{
            position: 'absolute',
            left: note.x,
            top: note.y,
            width: note.width,
            height: note.height,
          }}
        >
          <div
            onMouseDown={(e) => handleResizeStart(e, note)}
            className="resize-handle"/>
        </div>
      ))}
    </div>
  </main>
}

export default App;
