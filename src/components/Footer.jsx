import { Link } from 'react-router-dom'

const LOGO_SRC = '/logo.jpeg'
const APP_NAME = 'SodaMax Mauritius'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <Link to="/" className="footer__brand" aria-label={`${APP_NAME} home`}>
          <img src={LOGO_SRC} alt={APP_NAME} className="footer__logo" />
        </Link>

        <p className="footer__copy">&copy; {year} SodaMax Mauritius. All rights reserved.</p>
      </div>
    </footer>
  )
}
