import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { initializeApp } from "firebase/app";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import ChatRoom from './components/ChatRoom';
import SignIn from './components/SignIn';
import { SnackbarProvider } from 'notistack';

const firebaseConfig = {
  apiKey: "AIzaSyDiahgYqtFn4laL766h-dryzuxUXQbY76k",
  authDomain: "chatbot-redacre.firebaseapp.com",
  projectId: "chatbot-redacre",
  storageBucket: "chatbot-redacre.appspot.com",
  messagingSenderId: "805476528480",
  appId: "1:805476528480:web:1ab1019b5cd0697ff0ee05",
  measurementId: "G-8ZSJF8VGEK"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <SnackbarProvider maxSnack={5}>
      {user ? <ChatRoom app={app} /> : <SignIn app={app} />}
    </SnackbarProvider>
  );
}

export default App;