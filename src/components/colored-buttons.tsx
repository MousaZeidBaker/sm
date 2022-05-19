import Button from "@mui/material/Button";
import { green, red } from "@mui/material/colors";
import { Theme } from "@mui/material/styles";
import withStyles from "@mui/styles/withStyles";

export const GreenButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(green[300]),
    backgroundColor: green[300],
    "&:hover": {
      backgroundColor: green[500]
    }
  }
}))(Button);

export const RedButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(red[300]),
    backgroundColor: red[300],
    "&:hover": {
      backgroundColor: red[500]
    }
  }
}))(Button);
