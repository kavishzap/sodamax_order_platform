import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Cart from './components/Cart'
import Store from './pages/Store'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Store />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
        <Cart />
      </BrowserRouter>
    </CartProvider>
  )
}
