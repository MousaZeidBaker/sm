import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import { alpha } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import Fuse from "fuse.js";
import { useSnackbar } from "notistack";
import React, { ChangeEvent } from "react";

import { LoginItemApi } from "../backend/models/login/login-item-api";
import { Layout } from "../components/layout";
import LoginItemCard from "../components/login-item/login-item-card";
import { LoginItemFormDialog } from "../components/login-item/login-item-form-dialog";
import { useAuth } from "../hooks/useAuth";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  dataGrid: {
    border: 0
  },
  speedDial: {
    position: "absolute",
    color: theme.palette.primary.main,
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  },
  speedDialAction: {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    "&:hover": {
      backgroundColor: alpha(theme.palette.action.hover, 0.25)
    }
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    width: "100%"
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
}));

export default function Page(): JSX.Element {
  const [allItems, setAllItems] = React.useState<Array<LoginItemApi>>([]);
  const [itemsToShow, setItemsToShow] = React.useState<Array<LoginItemApi>>([]);
  const [lastSearchPattern, setLastSearchPattern] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openAddLoginItemFormDialog, setOpenAddLoginItemFormDialog] =
    React.useState<boolean>(false);

  const classes = useStyles();
  const { authStatus, getIdToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const fileInput = React.useRef<HTMLInputElement>(null);

  /**
   * Configure Fuse. Fuse is used for fuzzy-searching
   */
  const options: Fuse.IFuseOptions<LoginItemApi> = {
    includeScore: false,
    keys: ["attributes.title"]
  };
  const fuse = new Fuse(allItems, options);

  /**
   * Hook that fetches all items on page reload
   */
  React.useEffect(() => {
    const fetchData = async () => {
      if (authStatus !== "authenticated") return;

      setLoading(true);

      const response = await fetch("/api/v1/logins", {
        headers: {
          Authorization: await getIdToken()
        }
      });

      if (response.status === 200) {
        const jsonResponse = await response.json();

        setAllItems([...jsonResponse.data]);
      } else {
        enqueueSnackbar("Error! Couldn't load items.", { variant: "error" });
      }

      setLoading(false);
    };
    fetchData();
  }, [authStatus]);

  /**
   * Hook that updates itemsToShow list, triggered on changes to the allItems list
   */
  React.useEffect(() => {
    handleSearchChange(lastSearchPattern);
  }, [allItems]);

  /**
   * Handles Fab add event
   *
   * @return {void}
   */
  const handleFabAdd = (): void => {
    setOpenAddLoginItemFormDialog(true);
  };

  /**
   * Handles Fab export event
   *
   * @return {void}
   */
  const handleFabExport = (): void => {
    const data = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify({ data: allItems }, null, "\t")
    )}`;

    const link = document.createElement("a");
    link.download = "data.json";
    link.href = data;
    link.click();
  };

  /**
   * Handles Fab import event
   *
   * @return {void}
   */
  const handleFabImport = (): void => {
    fileInput.current?.click();
  };

  /**
   * Handles file input event
   *
   * @return {void}
   */
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e?.target?.files) return;
    const file = e.target.files[0];

    // get file content
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const content = JSON.parse(e?.target?.result as string);
      for (const item of content.data) {
        handleAdd(item);
      }
    };

    // reset reference for future triggers
    if (fileInput.current != undefined) fileInput.current.value = "";
  };

  /**
   * Handles add event
   *
   * @param {LoginItemApi} item - The item to add
   * @return {Promise<void>}
   */
  const handleAdd = async (item: LoginItemApi): Promise<void> => {
    setLoading(true);

    enqueueSnackbar("Adding item...", { variant: "info" });

    // API request to add new login item
    const response = await fetch(`/api/v1/${item.type}`, {
      method: "POST",
      headers: {
        Authorization: await getIdToken(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          type: item.type,
          attributes: {
            title: item.attributes.title,
            path: item.attributes.path,
            username: item.attributes.username,
            secret: item.attributes.secret,
            note: item.attributes.note
          }
        }
      })
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();

      const addedItem = jsonResponse.data;
      setAllItems((prevState) => {
        return [...prevState, addedItem];
      });
      enqueueSnackbar("Success! Item added.", { variant: "success" });
    } else {
      enqueueSnackbar("Error! Couldn't add item.", { variant: "error" });
    }

    setLoading(false);
  };

  /**
   * Handles delete event
   *
   * @param {string} id - The id of the item
   * @return {Promise<void>}
   */
  const handleDelete = async (id: string): Promise<void> => {
    setLoading(true);
    setAllItems(allItems.filter((item) => item.id !== id));
    setLoading(false);
  };

  /**
   * Handles search change event
   *
   * @param {string} pattern The search pattern to search for
   * @return {void}
   */
  const handleSearchChange = (pattern: string): void => {
    setLastSearchPattern(pattern);

    if (!pattern) {
      setItemsToShow(allItems);
      return;
    }

    const matches = fuse.search(pattern);
    if (matches.length === 0) {
      setItemsToShow([]);
    } else {
      setItemsToShow(
        matches.map((match) => {
          return match.item;
        })
      );
    }
  };

  return (
    <Layout showSearchBar={true} handleSearchChange={handleSearchChange}>
      {/* Progress bars */}
      <div>
        {loading && (
          <>
            <LinearProgress />
          </>
        )}
      </div>

      <Grid
        className={classes.root}
        container={true}
        justifyContent="flex-start"
        spacing={2}
      >
        {/* Item cards */}
        {itemsToShow.map(
          (item: LoginItemApi): JSX.Element => (
            <LoginItemCard
              key={item.id}
              item={item}
              handleDelete={handleDelete}
            />
          )
        )}
      </Grid>
      <div>
        {/* A speed dial button */}
        <SpeedDial
          className={classes.speedDial}
          ariaLabel="speedDial"
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            className={classes.speedDialAction}
            key="add"
            icon={<AddIcon />}
            tooltipTitle="Add"
            onClick={() => handleFabAdd()}
            open={true}
          />
          <SpeedDialAction
            className={classes.speedDialAction}
            key="export"
            icon={<DownloadIcon />}
            tooltipTitle="Export"
            onClick={() => handleFabExport()}
          />
          <SpeedDialAction
            className={classes.speedDialAction}
            key="import"
            icon={<UploadIcon />}
            tooltipTitle="Import"
            onClick={() => handleFabImport()}
          />
        </SpeedDial>
        <input
          ref={fileInput}
          accept=".json"
          type="file"
          style={{ display: "none" }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileInput(e)}
        />
      </div>
      <div>
        {/* An input form for adding items */}
        <LoginItemFormDialog
          title="Add item"
          open={openAddLoginItemFormDialog}
          setOpen={setOpenAddLoginItemFormDialog}
          item={{
            id: "",
            type: "logins",
            attributes: {
              version: 0,
              lastModifiedDate: new Date(),
              title: "",
              path: "/",
              username: "",
              secret: "",
              note: ""
            }
          }}
          handleSave={(item: LoginItemApi) => handleAdd(item)}
        />
      </div>
    </Layout>
  );
}
