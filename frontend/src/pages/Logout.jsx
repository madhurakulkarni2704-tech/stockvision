function Logout() {
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    alert("Logged out successfully!");
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Logout;