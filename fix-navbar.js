const fs = require("fs");
let content = fs.readFileSync("src/components/navbar.tsx", "utf8");

// Add onLogout function before the return statement
content = content.replace(
  "  function isItemActive(href: string) {\n    return href === pathname;\n  }\n\n  return (",
  "  function isItemActive(href: string) {\n    return href === pathname;\n  }\n\n  async function onLogout() {\n    try {\n      await fetch("/api/auth/logout", { method: "POST" });\n      window.location.href = "/login";\n    } catch (err) {\n      console.error("Logout failed:", err);\n    }\n  }\n\n  return ("
);

// Replace first form with button
content = content.replace(
  '          <form action="/api/auth/logout" method="POST" className="ml-2">\n            <button\n              type="submit"\n              className="flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-1.5 rounded transition"\n            >\n              <LogOut size={16} />\n              <span>Keluar</span>\n            </button>\n          </form>',
  '          <button\n            onClick={onLogout}\n            className="flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-1.5 rounded transition"\n          >\n            <LogOut size={16} />\n            <span>Keluar</span>\n          </button>'
);

// Replace second form with button
content = content.replace(
  '            <form action="/api/auth/logout" method="POST" className="-mx-2">\n              <button\n                type="submit"\n                className="w-full flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-2.5 rounded transition"\n              >\n                <LogOut size={16} />\n                <span>Keluar</span>\n              </button>\n            </form>',
  '            <button\n              onClick={onLogout}\n              className="w-full flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-2.5 rounded transition"\n            >\n              <LogOut size={16} />\n              <span>Keluar</span>\n            </button>'
);

fs.writeFileSync("src/components/navbar.tsx", content);
console.log("Navbar fixed: replaced form actions with onClick handlers");