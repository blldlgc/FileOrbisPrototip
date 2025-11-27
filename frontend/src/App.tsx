import { UserList } from './components/UserList'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Kullanıcı Yönetim Sistemi</h1>
        </header>
        <UserList />
      </div>
    </div>
  )
}

export default App
