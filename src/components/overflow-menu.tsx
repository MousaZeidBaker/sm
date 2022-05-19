import MoreVertIcon from "@mui/icons-material/MoreVert";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import React from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuItems: Array<JSX.Element>;
}

export function OverflowMenu(props: Props): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  /**
   * Handles menu click event
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event
   * @return {void}
   */
  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    setAnchorEl(event.currentTarget);
    props.setOpen(true);
  };

  /**
   * Handles menu close event
   *
   * @return {void}
   */
  const handleMenuClose = (): void => {
    setAnchorEl(null);
    props.setOpen(false);
  };

  return (
    <>
      {/* Overflow menu that opens over the anchor element */}
      <Button
        aria-controls="overflow-menu"
        aria-haspopup="true"
        title="Menu"
        onClick={handleMenuClick}
      >
        <MoreVertIcon />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted={true}
        open={props.open}
        onClose={handleMenuClose}
      >
        {props.menuItems}
      </Menu>
    </>
  );
}
