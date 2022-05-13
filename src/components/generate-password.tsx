import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { GreenButton, RedButton } from './colored-buttons'
import makeStyles from '@mui/styles/makeStyles'
import generator from 'generate-password'

const MAX_LENGTH = 50
const MIN_LENGTH = 4

const useStyles = makeStyles({
  textField: {
    marginLeft: 14,
    marginTop: 8
  },
  button: {
    marginLeft: 14,
    marginTop: 8
  },
  buttonNoTextTransform: {
    marginLeft: 14,
    marginTop: 8,
    textTransform: 'none'
  }
})

interface Props {
  handleChange: (key: string, value: string) => void
}

export function GeneratePassword(props: Props): JSX.Element {
  const [ length, setLength ] = React.useState(16)
  const [ lowercase, setLowercase ] = React.useState(true)
  const [ uppercase, setUppercase ] = React.useState(true)
  const [ numbers, setNumbers ] = React.useState(true)
  const [ symbols, setSymbols ] = React.useState(true)

  const classes = useStyles()

  /**
   * Handles autorenew event, generates a password
   * 
   * @return {void}
   */
  const handleAutorenew = (): void => {
    const password = generator.generate({
      length: length,
      lowercase: lowercase,
      uppercase: uppercase,
      numbers: numbers,
      symbols: symbols
    })
    props.handleChange('secret', password)
  }

  /**
   * Handles length change event
   * 
   * @return {void}
   */
  const handleLengthChange = (length: number): void => {
    setLength(length)
  }

  /**
   * Handles length blur event, makes sure length is within the specified range
   * 
   * @return {void}
   */
  const handleLengthBlur = (length: number): void => { 
    if (length < MIN_LENGTH || isNaN(length)) {
      setLength(MIN_LENGTH)
    }
    if (length > MAX_LENGTH) {
      setLength(MAX_LENGTH)
    }
  }

  return <>
    {/* Autorenew button */}
    <Button
      className = {classes.button}
      variant='contained'
      title='Generate'
      disabled={(!lowercase && !uppercase && !numbers && !symbols)}
      onClick={handleAutorenew}>
      <AutorenewIcon />
    </Button>
    <TextField
      className = {classes.textField}
      variant='outlined'
      id='length'
      label='Length'
      margin='dense'
      type='number'
      InputProps={{ inputProps: { min: MIN_LENGTH, max: MAX_LENGTH } }}
      value={length}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleLengthChange(event.target.valueAsNumber)}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => handleLengthBlur(event.target.valueAsNumber)}
    >
    </TextField>
    {/* Lowercase button */}
    {lowercase && <>
      <GreenButton
        className = {classes.buttonNoTextTransform}
        variant='contained'
        color='primary'
        title='Toggle lowercase on/off'
        onClick={() => setLowercase(!lowercase)}
      >
        a-z
      </GreenButton>
    </>}
    {!lowercase && <>
      <RedButton
        className = {classes.buttonNoTextTransform}
        variant='contained'
        color='primary'
        title='Toggle lowercase on/off'
        onClick={() => setLowercase(!lowercase)}
      >
        a-z
      </RedButton>
    </>}
    {/* Uppercase button */}
    {uppercase && <>
      <GreenButton
        className = {classes.button}
        variant='contained'
        color='primary'
        title='Toggle uppercase on/off'
        onClick={() => setUppercase(!uppercase)}
      >
        A-Z
      </GreenButton>
    </>}
    {!uppercase && <>
      <RedButton
        className = {classes.button}
        variant='contained'
        color='primary'
        title='Toggle uppercase on/off'
        onClick={() => setUppercase(!uppercase)}
      >
        A-Z
      </RedButton>
    </>}
    {/* Numbers button */}
    {numbers && <>
      <GreenButton
        className = {classes.button}
        variant='contained'
        color='primary'
        title='Toggle numbers on/off'
        onClick={() => setNumbers(!numbers)}
      >
        0-9
      </GreenButton>
    </>}
    {!numbers && <>
      <RedButton
        className = {classes.button}
        variant='contained'
        color='primary'
        title='Toggle numbers on/off'
        onClick={() => setNumbers(!numbers)}
      >
        0-9
      </RedButton>
    </>}
    {/* Symbols button */}
    {symbols && <>
      <GreenButton
        className = {classes.button}
        variant='contained'
        color='primary'
        title='Toggle symbols on/off'
        onClick={() => setSymbols(!symbols)}
      >
        !#@
      </GreenButton>
    </>}
    {!symbols && <>
      <RedButton
        className = {classes.button}
        variant='contained'
        color='primary'
        title='Toggle symbols on/off'
        onClick={() => setSymbols(!symbols)}
      >
        !#@
      </RedButton>
    </>}
  </>
}
