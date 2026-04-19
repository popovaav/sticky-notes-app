import './App.css'
import type { Note, Position } from './types/note'
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
  const frameRef = useRef<number | null>(null)


  // Handle mouse up globally to stop drag/resize even outside the board
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingId(null)
      setResizingId(null)
      setDragOffset({ x: 0, y: 0 })
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
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

  const getMousePosition = (e: MouseEvent<HTMLDivElement>, board: HTMLDivElement): Position => {
    const rect = board.getBoundingClientRect()

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleDragMove = (position: Position) => {
    const board = boardRef.current
    if (!draggingId || !board) return

    const { x: mouseX, y: mouseY } = position

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

  const handleResizeMove = (position: Position) => {
    const board = boardRef.current
    if (!resizingId || !board) return

    const { x: mouseX, y: mouseY } = position

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
    const board = boardRef.current
    if (!board) return

    const position = getMousePosition(e, board)
    const { x: mouseX, y: mouseY } = position

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
    setDragOffset({ x: 0, y: 0 })
  }

  // Limit state updates during drag/resize using requestAnimationFrame
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const board = boardRef.current
    if (frameRef.current || (!draggingId && !resizingId) || !board) return

    const position = getMousePosition(e, board)
    const moveHandler = resizingId ? handleResizeMove : handleDragMove

    frameRef.current = requestAnimationFrame(() => {
      moveHandler(position)
      frameRef.current = null
    })
  }

  return <main>
    <h1>Sticky Notes</h1>
    <button onClick={createNote}>Add note</button>

    <div
      ref={boardRef}
      className="board"
      onMouseMove={handleMouseMove}
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
