export default function Navbar() {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-green-700">DysCalc</h1>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/login">Login</a>
        </nav>
      </div>
    </header>
  );
}