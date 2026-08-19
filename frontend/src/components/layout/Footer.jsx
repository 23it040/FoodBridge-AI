const Footer = () => (
  <footer className="border-t border-slate-200 bg-white py-8 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>© {new Date().getFullYear()} FoodBridge AI. All rights reserved.</p>
      <p>Connecting donors and NGOs with intelligent matching and reliable route planning.</p>
    </div>
  </footer>
);

export default Footer;
