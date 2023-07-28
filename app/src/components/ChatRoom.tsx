import * as React from 'react';
import { addDoc, collection, getFirestore, limit, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useState } from "react";
import { Question, chatroomProps, messageProps } from "../lib/questions";
import { getAuth } from "firebase/auth";
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Badge, Button, Chip, Grid, Paper, Skeleton, TextField, Typography, styled } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import Zoom from '@mui/material/Zoom';
import Fab from '@mui/material/Fab';
import { green } from '@mui/material/colors';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

const fabStyle = {
  position: 'absolute',
  bottom: 16,
  right: 16,
};

const fabGreenStyle = {
  color: 'common.white',
  bgcolor: green[500],
  '&:hover': {
    bgcolor: green[600],
  },
};

const scrollBottom = () => {
  console.debug("scrollBottom")
  document.getElementById('end-of-chat')?.scrollIntoView({ behavior: 'smooth' });
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

function ChatRoom(props: chatroomProps) {
  const { app } = props;
  
  const theme = useTheme();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const questionsRef = collection(firestore, 'questions');
  const q = query(questionsRef, limit(25), orderBy('createdAt'))

  const [snapshot, loading, error] = useCollection(q, {snapshotListenOptions: { includeMetadataChanges: true }});
  const [formValue, setFormValue] = useState('');
  const [chatting, setChatting] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuLogout = () => {
    auth.signOut();
    setAnchorEl(null);
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if(auth.currentUser){
      const { uid, photoURL }= auth.currentUser;

      await addDoc(questionsRef, {
        question: formValue,
        createdAt: new Date(),
        userId: uid,
        userPic: photoURL
      } as Question)

      setFormValue('');
      scrollBottom();
    }
  }

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const handleChatting = () => {
    setChatting(!chatting);
    if(!chatting) setTimeout(scrollBottom, 500)
  }

  const fabs = [
    {
      color: 'primary' as 'primary',
      sx: fabStyle as SxProps,
      icon: <ContactSupportIcon />,
      label: 'Start Chat',
    },
    {
      color: 'secondary' as 'secondary',
      sx: fabStyle as SxProps,
      icon: <CloseFullscreenIcon />,
      label: 'Close Chat',
    },
  ];


  return (
  <>
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: 500,
        position: 'relative',
        minHeight: 200,
      }}
    >
      <Zoom
        key={chatting?1:0}
        in={true}
        timeout={transitionDuration}
        style={{
          transitionDelay: `${chatting ? transitionDuration.exit : 0}ms`,
        }}
        unmountOnExit
      >
        <Fab onClick={handleChatting} sx={fabs[chatting?1:0].sx} aria-label={fabs[chatting?1:0].label} color={fabs[chatting?1:0].color}>
          {fabs[chatting?1:0].icon}
        </Fab>
      </Zoom>
    </Box>
    <Dialog open={chatting}>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
          <Tooltip title="Account settings" style={{margin: '0px'}}>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={menuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
            </IconButton>
          </Tooltip>
          <IconButton aria-label="Close" onClick={handleChatting}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Avatar /> My account
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            Add another account
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>

          <MenuItem onClick={handleMenuLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {error && <strong>Error: {JSON.stringify(error)}</strong>}
          {loading && <span>Loading previous discussion...</span>}
          {snapshot && (
            <main>
              {snapshot && snapshot.docs.map((question, index) => <ChatMessage key={question.id} question={question.data() as Question} />)}
              <Divider id="end-of-chat">
                <Chip label="Anything Else?" />
              </Divider>
            </main>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <form onSubmit={sendMessage} style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gridAutoFlow: 'column',
          gap: '5%',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <TextField
            id="filled-basic"
            required
            label="Question"
            placeholder='Ask me anything...'
            variant="filled"
            value={formValue}
            fullWidth
            onChange={(e) => setFormValue(e.target.value)}
          />
          {(snapshot?.docs.at(-1)?.data() as Question)?.response ?
            <Button
              type="submit"
              endIcon={<SendIcon />}
              variant="contained"
            >
              <span>Send</span>
            </Button>:
            <LoadingButton
              type="submit"
              endIcon={<SendIcon />}
              loading={true}
              loadingPosition="end"
              variant="contained"
            >
              <span>Thinking</span>
            </LoadingButton>
          }
        </form>
      </DialogActions>
    </Dialog>
  </>
  )
}


const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  maxWidth: 600,
  color: theme.palette.text.primary,
}));


function ChatMessage(props: messageProps) {
  const { question, response, userPic, userId } = props.question;

  return (
    <>
      <StyledPaper sx={{ my: 1, mx: 'auto', p: 2, }}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item xs>
            <Typography variant="body1" style={{textAlign: 'right'}} gutterBottom>{question}</Typography>
          </Grid>
          <Grid item>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar alt="Remy Sharp" src={userPic || "https://api.dicebear.com/6.x/adventurer/svg?seed=Midnight"} />
            </StyledBadge>
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper sx={{ my: 1, mx: 'auto', p: 2, }}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar alt="Remy Sharp" src="https://api.dicebear.com/6.x/bottts/svg?seed=Kiki" />
            </StyledBadge>
          </Grid>
          <Grid item xs>
            {response ?
              <Typography variant="body1" gutterBottom>{response}</Typography>:
              <Skeleton variant="rectangular" width={210} height={60} />
            }
          </Grid>
        </Grid>
      </StyledPaper>
    </>
  )
}

export default ChatRoom;