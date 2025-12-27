import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import Dataset from '@/pages/Dataset'
import Statistics from '@/pages/Statistics'
import About from '@/pages/About'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-6 max-w-6xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

export default App
