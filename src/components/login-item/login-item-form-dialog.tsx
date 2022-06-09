import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

import { LoginItemApi } from "../../backend/models/login/login-item-api";
import { CopyContentIcon } from "../../icons/content_copy-icon";
import { GeneratePassword } from "../generate-password";

const useStyles = makeStyles({
  button: {
    marginTop: 8
  }
});

export interface LoginItemFormValues {
  title: string;
  path: string;
  username: string;
  secret: string;
  otp: string;
  note: string;
}

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  item: LoginItemApi;
  handleSave: (item: LoginItemApi) => void;
}

export function LoginItemFormDialog(props: Props): JSX.Element {
  const [formValues, setFormValues] = React.useState<LoginItemFormValues>(
    props.item.attributes
  );
  const [titleTextFieldError, setTitleTextFieldError] =
    React.useState<boolean>(false);
  const [usernameTextFieldError, setUsernameTextFieldError] =
    React.useState<boolean>(false);
  const [secretTextFieldError, setSecretTextFieldError] =
    React.useState<boolean>(false);
  const [otpTextFieldError, setOtpTextFieldError] =
    React.useState<boolean>(false);
  const [noteTextFieldError, setNoteTextFieldError] =
    React.useState<boolean>(false);
  const [disableSaveButton, setDisableSaveButton] =
    React.useState<boolean>(false);

  const classes = useStyles();

  // Determine if save button should be disabled
  React.useEffect(() => {
    const disableEnableSaveButton = async () => {
      let disable = false;

      // Disable button if one of the fields are wrong
      if (
        titleTextFieldError ||
        usernameTextFieldError ||
        secretTextFieldError ||
        otpTextFieldError ||
        noteTextFieldError
      )
        disable = true;

      // Disable button if one of the required fields are empty
      const requiredFields = ["title, username", "secret"];
      for (const [key, value] of Object.entries(formValues)) {
        if (value === "" && requiredFields.includes(key)) disable = true;
      }

      setDisableSaveButton(disable);
    };
    disableEnableSaveButton();
  }, [formValues]);

  /**
   * Handles close event
   *
   * @return {void}
   */
  const handleClose = (): void => {
    // Close dialog
    props.setOpen(false);
    // Restore form values to their initial value
    setFormValues(props.item.attributes);

    // Restore text field error indicator
    setTitleTextFieldError(false);
    setUsernameTextFieldError(false);
    setSecretTextFieldError(false);
    setOtpTextFieldError(false);
    setNoteTextFieldError(false);
  };

  /**
   * Validate form input
   *
   * @param {keyof LoginItemFormValues} key
   * @param {string} value
   *
   * @return {void}
   */
  const validateInput = (
    key: keyof LoginItemFormValues,
    value: string
  ): void => {
    const pattern = new RegExp(
      // eslint-disable-next-line no-useless-escape
      /^[a-zA-Z0-9!\"#$%&'()*+,-./:;<=>?@[\\\]\^_`{\|}~]*$/gm
    );
    switch (key) {
      case "title": {
        let error = false;
        if (!value?.match(pattern) || value.length < 1 || value.length > 50) {
          error = true;
        }
        setTitleTextFieldError(error);
        return;
      }
      case "username": {
        let error = false;
        if (!value?.match(pattern) || value.length < 1 || value.length > 50) {
          error = true;
        }
        setUsernameTextFieldError(error);
        return;
      }
      case "secret": {
        let error = false;
        if (!value?.match(pattern) || value.length < 1 || value.length > 50) {
          error = true;
        }
        setSecretTextFieldError(error);
        return;
      }
      case "otp": {
        let error = false;
        if (value.length > 0 && !value?.match(pattern)) {
          error = true;
        }
        if (value.length > 50) {
          error = true;
        }
        setOtpTextFieldError(error);
        return;
      }
      case "note": {
        let error = false;
        if (value.length > 1000) {
          error = true;
        }
        setNoteTextFieldError(error);
        return;
      }
      default: {
        return;
      }
    }
  };

  /**
   * Handles form value change event
   *
   * @param {keyof LoginItemFormValues} key
   * @param {string} value
   *
   * @return {void}
   */
  const handleChange = (
    key: keyof LoginItemFormValues,
    value: string
  ): void => {
    setFormValues({ ...formValues, [key]: value });
    validateInput(key as keyof LoginItemFormValues, value);
  };

  /**
   * Handles save event
   *
   * @return {void}
   */
  const handleSave = (): void => {
    // Close dialog
    props.setOpen(false);
    // In case its add new item form (empty id), make sure to clean up the form
    if (props.item.id === "") {
      setFormValues(props.item.attributes);
    }

    // Prepare new item
    const item: LoginItemApi = {
      id: props.item.id,
      type: props.item.type,
      attributes: {
        version: props.item.attributes.version + 1,
        lastModifiedDate: new Date(),
        title: formValues.title,
        path: formValues.path,
        username: formValues.username,
        secret: formValues.secret,
        otp: formValues.otp,
        note: formValues.note
      }
    };
    // Execute parent component functionality
    props.handleSave(item);
  };

  return (
    <>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          {/* Title text filed */}
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            margin="dense"
            id="title"
            label="Title"
            type="text"
            error={titleTextFieldError}
            value={formValues.title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("title", event.target.value)
            }
          />
          {/* Username text filed */}
          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            id="username"
            label="Username"
            type="text"
            error={usernameTextFieldError}
            value={formValues.username}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("username", event.target.value)
            }
          />
          {/* Secret text filed */}
          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            id="secret"
            label="Secret"
            type="text"
            error={secretTextFieldError}
            value={formValues.secret}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("secret", event.target.value)
            }
          />
          {/* OTP text filed */}
          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            id="otp"
            label="One-time password"
            type="text"
            error={otpTextFieldError}
            value={formValues.otp}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("otp", event.target.value)
            }
          />
          {/* Note text filed */}
          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            id="note"
            label="Note"
            type="text"
            multiline={true}
            rows={4}
            error={noteTextFieldError}
            value={formValues.note}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("note", event.target.value)
            }
          />
          {/* Copy button */}
          <Button
            className={classes.button}
            variant="contained"
            title="Copy"
            onClick={() => navigator.clipboard.writeText(formValues.secret)}
          >
            <CopyContentIcon />
          </Button>
          {/* Generate password component */}
          {/* @ts-expect-error not assignable type */}
          <GeneratePassword handleChange={handleChange} />
        </DialogContent>
        <DialogActions>
          {/* Cancel button */}
          <Button
            variant="contained"
            title="Cancel"
            startIcon={<CancelIcon />}
            onClick={handleClose}
          >
            Cancel
          </Button>
          {/* Save button */}
          <Button
            variant="contained"
            color="primary"
            title="Save"
            disabled={disableSaveButton}
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
