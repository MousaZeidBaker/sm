import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import CancelIcon from '@material-ui/icons/Cancel'
import SaveIcon from '@material-ui/icons/Save'
import { GeneratePassword } from '../generate-password'
import { CopyContentIcon } from '../../icons/content_copy-icon'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
  button: {
    marginTop: 8
  }
})

export interface LoginItemFormValues {
  title: string
  username: string
  secret: string
  path: string
}

interface Props {
  initialFormValues: LoginItemFormValues
  open: boolean
  setOpen: (open: boolean) => void
  itemType: string
  handleSave: (formValues: LoginItemFormValues) => void
}

export function LoginItemDialog(props: Props): JSX.Element {
  const [formValues, setFormValues] = React.useState<LoginItemFormValues>(props.initialFormValues)
  const [titleTextFieldError, setTitleTextFieldError] = React.useState<boolean>(false)
  const [usernameTextFieldError, setUsernameTextFieldError] = React.useState<boolean>(false)
  const [passwordTextFieldError, setPasswordTextFieldError] = React.useState<boolean>(false)
  const [disableSaveButton, setDisableSaveButton] = React.useState<boolean>(false)

  const classes = useStyles()

  // Determine if save button should be disabled
  React.useEffect(() => {
    const disableEnableSaveButton = async () => {
      let disable = false

      // Disable button if one of the fields are wrong
      if (titleTextFieldError || usernameTextFieldError || passwordTextFieldError) disable = true
      
      // Disable button if one of the fields are empty
      Object.values(formValues).forEach(item => {
        if (item === '') disable = true
      })

      setDisableSaveButton(disable)
    }
    disableEnableSaveButton()
  },[formValues])

  /**
   * Handles close event
   * 
   * @return {void}
   */
  const handleClose = (): void => {
    props.setOpen(false)
    // Restore form values to their initial value
    setFormValues(props.initialFormValues)

    // Restore text field error indicator
    setTitleTextFieldError(false)
    setUsernameTextFieldError(false)
    setPasswordTextFieldError(false)
  }

  /**
   * Validate form input
   * 
   * @param {keyof LoginItemFormValues} key
   * @param {string} value
   * 
   * @return {void}
   */
    const validateInput = (key: keyof LoginItemFormValues, value: string): void => {
      const pattern = new RegExp(/^[a-zA-Z0-9!\"#$%&'()*+,-./:;<=>?@[\\\]\^_`{\|}~]{1,50}$/gm)
      switch(key) {
        case 'title': {
          if (value?.match(pattern)) {
            setTitleTextFieldError(false)
          } else {
            setTitleTextFieldError(true)
          }
          return
        }
        case 'username': {
          if (value?.match(pattern)) {
            setUsernameTextFieldError(false)
          } else {
            setUsernameTextFieldError(true)
          }
          return
        }
        case 'secret': {
          if (value?.match(pattern)) {
            setPasswordTextFieldError(false)
          } else {
            setPasswordTextFieldError(true)
          }
          return
        }
        default: {
          return
        }
      }
    }

  /**
   * Handles form value change event
   * 
   * @param {keyof LoginItemFormValues} key
   * @param {string} value
   * 
   * @return {void}
   */
  const handleChange = (key: keyof LoginItemFormValues, value: string): void => {
    setFormValues({ ...formValues, [key]: value })
    validateInput(key as keyof LoginItemFormValues, value)
  }

  /**
   * Handles save event
   * 
   * @return {Promise<void>}
   */
  const handleSave = async (): Promise<void> => {
    // Close dialog immediately, use snackbar to inform user about the process
    props.setOpen(false)

    // Execute parent component functionality
    props.handleSave(formValues)

    // Restore form values to their initial value
    setFormValues(props.initialFormValues)
  }

  return (
    <>
      <DialogContent>
      {/* Title text filed */}
      <TextField
          autoFocus
          fullWidth
          variant='outlined'
          margin='dense'
          id='title'
          label='Title'
          type='text'
          error={titleTextFieldError}
          value={formValues.title}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('title', event.target.value)}
        />
        {/* Username text filed */}
        <TextField
          fullWidth
          variant='outlined'
          margin='dense'
          id='username'
          label='Username'
          type='text'
          error={usernameTextFieldError}
          value={formValues.username}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('username', event.target.value)}
        />
        {/* Secret text filed */}
        <TextField
          fullWidth
          variant='outlined'
          margin='dense'
          id='secret'
          label='Secret'
          type='text'
          error={passwordTextFieldError}
          value={formValues.secret}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('secret', event.target.value)}
        />
        {/* Copy button */}
        <Button
          className={classes.button}
          variant='contained'
          color='default'
          title='Copy'
          onClick={() => navigator.clipboard.writeText(formValues.secret)}
        >
          <CopyContentIcon />
        </Button>
        {/* Generate password component */}
        {/* @ts-expect-error */}
        <GeneratePassword handleChange={handleChange} />
      </DialogContent>
      <DialogActions>
        {/* Cancel button */}
        <Button
          variant='contained'
          color='default'
          title='Cancel'
          startIcon={<CancelIcon />}
          onClick={handleClose}
        >
          Cancel
        </Button>
        {/* Save button */}
        <Button
          variant='contained'
          color='primary'
          title='Save'
          disabled={disableSaveButton}
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </>
  )
}
