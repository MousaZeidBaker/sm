import React from 'react'
import { Layout } from '../../components/layout'
import { OverflowMenu } from '../../components/overflow-menu'
import { LoginItemApi } from '../../backend/models/login/login-item-api'
import { Secret } from '../../components/secret'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useSession from '../../components/useSession'
import { Theme } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'

import Grid from '@material-ui/core/Grid'

import clsx from 'clsx'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import Button from '@material-ui/core/Button'
import { CopyContentIcon } from '../../icons/content_copy-icon'

import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'

import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    // maxWidth: 345,
    // height: 100,
    padding: theme.spacing(2),
    // textAlign: 'center',
    color: theme.palette.primary.main,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  buttons: {
    marginTop: 16
  },
  button: {
    marginRight: -8
  }
}))

interface Props {
  item: LoginItemApi
  handleDelete: (id: string) => void
  handleVersionChange: (id: string, version: number) => void
}

export default function LoginItemCard(props: Props): JSX.Element {

  const [ item, setItem ] = React.useState<LoginItemApi>(props.item)
  const [ expanded, setExpanded ] = React.useState(false)
  const [ showSecret, setShowSecret ] = React.useState<boolean>(false)
  const [ loading, setLoading ] = React.useState<boolean>(false)

  const classes = useStyles()
  const { session } = useSession()
  const { enqueueSnackbar } = useSnackbar()

  /**
   * Handles edit event
   * 
   * @param {LoginItemApi} item - The item to update
   * @return {void}
   */
  const handleEdit = async (item: LoginItemApi): Promise<void> => {
    setLoading(true)

    enqueueSnackbar("Updating item...", { variant: 'info' })

    // API request to edit login item
    const response = await fetch(`/api/v1.0/${item.type}/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': session?.idToken || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'data': {
          'type': item.type,
          'id': item.id,
          'attributes': {
            title: item.attributes.title,
            path: item.attributes.path,
            username: item.attributes.username,
            secret: item.attributes.secret
          }
        }
      })
    })

    if (response.status === 200) {
      const jsonResponse = await response.json()

      const updatedItem = jsonResponse.data
      setItem(updatedItem)
      enqueueSnackbar("Success! Item updated.", { variant: 'success' })
    } else {
      enqueueSnackbar("Error! Couldn't update item.", { variant: 'error' })
      return
    }

    setLoading(false)
  }

  return (
    <Grid key={item.id} item={true} xs={12} sm={4}>
    <Card className={classes.card}>
      <CardHeader
        action={
          <div>
            <div>
              <OverflowMenu
                item={item}
                handleEdit={(item: LoginItemApi) => handleEdit(item)}
                handleDelete={() => props.handleDelete(item.id)}
              />
            </div>
            <div>
              {loading && <>
                <CircularProgress/>
              </>}
            </div>
          </div>
        }
        title={item.attributes.title}
        subheader={new Date(item.attributes.lastModifiedDate).toDateString()}
      />
      <CardContent>
        <Typography variant='body2' color='textSecondary' component='p'>
          This is a very very very very short description
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label='show more'
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout='auto' unmountOnExit>
        <CardContent>
          <Typography paragraph color='textSecondary'>Version:</Typography>
          <Typography paragraph>{item.attributes.version}</Typography>
          <Typography paragraph color='textSecondary'>Username:</Typography>
          <Typography paragraph>{item.attributes.username}</Typography>
          <Typography paragraph color='textSecondary'>Secret:</Typography>
          {showSecret && <>
            <Typography paragraph>{item.attributes.secret}</Typography>
          </>}
          {!showSecret && <>
            <Typography paragraph>{item.attributes.secret.replace(/.?/g, '\u2022')}</Typography>
          </>}

          <Divider />

          <div className={classes.buttons}>
            {/* Hide/Show button */}
            <Button
              className={classes.button}
              size='small'
              color='default'
              title={showSecret ? 'Hide' : 'Show'}
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? < VisibilityOff/> : <VisibilityIcon />}
            </Button>
            {/* Copy button */}
            <Button
              className={classes.button}
              size='small'
              color='default'
              title='Copy'
              onClick={() => navigator.clipboard.writeText(item.attributes.secret)}
              >
                <CopyContentIcon/>
            </Button>
            {/* Arrow up button */}
            <Button
              className={classes.button}
              size='small'
              color='default'
              title='Version up'
              onClick={() => props.handleVersionChange(item.id, item.attributes.version + 1)}
            >
              <ArrowUpwardIcon/>
            </Button>
            {/* Arrow down button */}
            <Button
              className={classes.button}
              size='small'
              color='default'
              title='Version down'
              disabled={item.attributes.version < 2}
              onClick={() => props.handleVersionChange(item.id, item.attributes.version - 1)}
            >
              <ArrowDownwardIcon/>
            </Button>
          </div>
        </CardContent>
      </Collapse>
    </Card>
    </Grid>
  )
}
