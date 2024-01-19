import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Link } from "react-router-dom";
export default function BurgerMenu({ setOpenMenu, openMenu }) {
  const menuOptions = [
    {
      text: "Home",
      icon: <HomeIcon />,
      path: "/",
    },
    {
      text: "Current Trip",
      icon: <DirectionsBikeIcon />,
      path: "/ongoing",
    },
    {
      text: "Past Trips",
      icon: <TimelineIcon />,
      path: "/done",
    },
  ];
  return (
    <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={() => setOpenMenu(false)}
        onKeyDown={() => setOpenMenu(false)}
      >
        <List>
          {menuOptions.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Link
                style={{ textDecoration: "none", color: "inherit" }}
                to={item.path}
              >
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    style={{ textDecoration: "none" }}
                    primary={item.text}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
}
