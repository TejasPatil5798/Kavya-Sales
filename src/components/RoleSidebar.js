import { useState } from "react";
import AdminSidebar from "./sidebars/AdminSidebar";
import UserSidebar from "./sidebars/UserSidebar";

const RoleSidebar = ({ onLogout }) => {
  const role = localStorage.getItem("role")?.toLowerCase().trim();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  if (role === "admin") {
    return (
      <AdminSidebar
        onLogout={onLogout}
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
    );
  }

  return (
    <UserSidebar
      onLogout={onLogout}
      isOpen={isOpen}
      toggleSidebar={toggleSidebar}
      closeSidebar={closeSidebar}
    />
  );
};

export default RoleSidebar;
