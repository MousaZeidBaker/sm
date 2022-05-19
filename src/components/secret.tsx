import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

import { CopyContentIcon } from "../icons/content_copy-icon";

const useStyles = makeStyles({
  button: {
    marginRight: 16
  }
});

interface Props {
  secret: string;
}

export function Secret(props: Props): JSX.Element {
  const [showSecret, setShowSecret] = React.useState<boolean>(false);
  const classes = useStyles();

  return (
    <>
      <Button
        className={classes.button}
        size="small"
        variant="contained"
        title={showSecret ? "Hide" : "Show"}
        onClick={() => setShowSecret(!showSecret)}
      >
        {showSecret ? <VisibilityOff /> : <VisibilityIcon />}
      </Button>

      <Button
        className={classes.button}
        size="small"
        variant="contained"
        title="Copy"
        onClick={() => navigator.clipboard.writeText(props.secret)}
      >
        <CopyContentIcon />
      </Button>

      {showSecret && (
        <>
          <Typography paragraph>{props.secret}</Typography>
        </>
      )}
      {!showSecret && (
        <>
          <Typography paragraph>
            {props.secret.replace(/.?/g, "\u2022")}
          </Typography>
        </>
      )}
    </>
  );
}
