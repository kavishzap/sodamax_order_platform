export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p className="footer__text">&copy; {year} SodaMax Mauritius</p>
      <p className="footer__tagline">Sparkle Every Moment</p>
    </footer>
  )
}
