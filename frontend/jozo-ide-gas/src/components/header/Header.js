import { Link, useMatch, useResolvedPath } from "react-router-dom";
import React, { useState } from "react";
import Logo from "../../assets/Logo.png";
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
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <Link className={isActive ? "active" : ""} to={to} {...props}>
      {children}
    </Link>
  );
}
