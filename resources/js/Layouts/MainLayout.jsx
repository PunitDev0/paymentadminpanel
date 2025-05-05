import React, { useState } from "react";
import Sidebar from "@/Layouts/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePage } from "@inertiajs/react";
import Navbar from "@/Layouts/navbar";

export default function MainLayout({ children }) {
  const { url } = usePage(); // Detect route changes
  const { user } = usePage().props;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar - Hidden on md and below, fixed width on lg and above */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col w-full lg:ml-72">
        {/* Navbar - Fixed at the top */}
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        {/* Animated Main Content with Proper Padding */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={url}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}