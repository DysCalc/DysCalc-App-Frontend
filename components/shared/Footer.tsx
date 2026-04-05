export default function Footer() {
  return (
    <footer className="bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 py-4 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left */}
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} DysCalc.Thesis Project by the Department of Computer Science students of MSU-Iligan Institute of Technology
        </p>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <a href="#" className="hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}