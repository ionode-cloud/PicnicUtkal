export default function Footer() {
  return (
    <footer className="admin-footer-copyright">
      <div className="flex justify-between items-center w-full">
        <span>© {new Date().getFullYear()} PicnicUtkal Admin. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover-link">Privacy Policy</a>
          <a href="#" className="hover-link">Terms of Service</a>
          <a href="#" className="hover-link">Support Desk</a>
        </div>
      </div>
    </footer>
  )
}
