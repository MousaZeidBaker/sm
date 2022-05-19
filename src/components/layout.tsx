import makeStyles from "@mui/styles/makeStyles";
import React from "react";

import { Header } from "./header";

const useStyles = makeStyles({
  main: {
    marginTop: "1%",
    marginLeft: "10%",
    marginRight: "10%"
  }
});

interface Props {
  children: React.ReactNode;
  showSearchBar: boolean;
  handleSearchChange: (pattern: string) => void;
}

export function Layout(props: Props): JSX.Element {
  const classes = useStyles();

  return (
    <>
      <Header
        showSearchBar={props.showSearchBar}
        handleSearchChange={props.handleSearchChange}
      />
      <main className={classes.main}>{props.children}</main>
    </>
  );
}
