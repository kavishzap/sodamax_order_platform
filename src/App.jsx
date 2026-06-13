import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Cart from './components/Cart'
import Store from './pages/Store'
import Checkout from './pages/Checkout'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Store />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
        <Cart />
      </BrowserRouter>
    </CartProvider>
  )
}
