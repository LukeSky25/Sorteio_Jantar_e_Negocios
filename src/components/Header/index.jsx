import "./style.css";
import logo from "../../assets/logo.png";
function Header() {
  return (
    <nav className="navbar">
      <img src={logo} alt="" />
    </nav>
  );
}

export default Header;
