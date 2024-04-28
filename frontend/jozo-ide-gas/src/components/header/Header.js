import { Link, useLocation, useResolvedPath } from "react-router-dom";
import React, { useState } from "react";
import Logo from "../../assets/Logo.png";
import BuyMeACoffee from "../../assets/white-button.png";
import { HiOutlineBars3 } from "react-icons/hi2";
import BurgerMenu from "./BurgerMenu";
import "./Header.css";
export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <nav>
      <Link to="/" className="nav-logo-container">
        <img src={Logo} width={70} alt="" />
      </Link>
      <div className="navbar-links-container">
        <CustomLink to="/">Home</CustomLink>
        <CustomLink to="/ongoing">Current Trip</CustomLink>
        <CustomLink to="/done">Past Trips</CustomLink>
        <Link to="https://buymeacoffee.com/jozoidegas" target="_blank" rel="noopener noreferrer">
          <img src={BuyMeACoffee} width={160} alt="" />
        </Link>
      </div>
      <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
      </div>
      <BurgerMenu openMenu={openMenu} setOpenMenu={setOpenMenu} />
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const location = useLocation();
  const isActive =
    resolvedPath.pathname === "/"
      ? location.pathname === "/"
      : location.pathname.includes(resolvedPath.pathname);

  return (
    <Link className={isActive ? "active" : ""} to={to} {...props}>
      {children}
    </Link>
  );
}
